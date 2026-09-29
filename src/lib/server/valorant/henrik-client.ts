import { env } from '$env/dynamic/private';
import {
  buildCompetitivePerformance,
  type CompetitiveMatchInput,
  type PlayerDashboard,
} from '$lib/player-dashboard';
import type { PlayerProfile } from '$lib/player-profile';

const HENRIK_API_URL = 'https://api.henrikdev.xyz';
const COMPETITIVE_MATCH_PAGE_SIZE = 20;
const COMPETITIVE_MATCH_LIMIT = 100;
const DASHBOARD_CACHE_DURATION_MS = 15 * 60 * 1000;

type CompetitiveMatchPage = {
  matches: CompetitiveMatchInput[];
  returnedMatchCount: number;
};

type DashboardCacheEntry = {
  dashboard: PlayerDashboard;
  expiresAt: number;
};

const dashboardCache = new Map<string, DashboardCacheEntry>();

type HenrikAccountResponse = {
  data: {
    puuid: string;
    region: string;
    account_level: number;
    name: string;
    tag: string;
    card: {
      id: string;
      small: string;
      large: string;
      wide: string;
    };
    last_update: string;
  };
  status: number;
};

export class PlayerLookupError extends Error {
  constructor(
    public readonly kind: 'invalid-input' | 'not-found' | 'upstream',
    message: string,
  ) {
    super(message);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function parseAccountResponse(value: unknown): HenrikAccountResponse {
  if (
    !isRecord(value) ||
    typeof value.status !== 'number' ||
    !isRecord(value.data)
  ) {
    throw new PlayerLookupError(
      'upstream',
      'HenrikDev returned an unexpected account response.',
    );
  }

  const { data } = value;
  if (
    !isNonEmptyString(data.puuid) ||
    !isNonEmptyString(data.region) ||
    !isNonNegativeSafeInteger(data.account_level) ||
    !isNonEmptyString(data.name) ||
    !isNonEmptyString(data.tag) ||
    !isNonEmptyString(data.last_update) ||
    !isRecord(data.card) ||
    !isNonEmptyString(data.card.id) ||
    !isNonEmptyString(data.card.small) ||
    !isNonEmptyString(data.card.large) ||
    !isNonEmptyString(data.card.wide)
  ) {
    throw new PlayerLookupError(
      'upstream',
      'HenrikDev returned incomplete account data.',
    );
  }

  return value as HenrikAccountResponse;
}

function validateRiotIdPart(value: string, label: string): string {
  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > 32) {
    throw new PlayerLookupError(
      'invalid-input',
      `${label} must contain between 1 and 32 characters.`,
    );
  }

  return normalized;
}

function requiredRecord(
  value: unknown,
  message: string,
): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new PlayerLookupError('upstream', message);
  }

  return value;
}

function requiredString(
  record: Record<string, unknown>,
  key: string,
  message: string,
): string {
  if (!isNonEmptyString(record[key])) {
    throw new PlayerLookupError('upstream', message);
  }

  return record[key];
}

function requiredNonNegativeInteger(
  record: Record<string, unknown>,
  key: string,
  message: string,
): number {
  if (!isNonNegativeSafeInteger(record[key])) {
    throw new PlayerLookupError('upstream', message);
  }

  return record[key];
}

function optionalNonNegativeInteger(
  record: Record<string, unknown>,
  key: string,
  message: string,
): number | null {
  const value = record[key];
  if (value === undefined || value === null) {
    return null;
  }

  if (!isNonNegativeSafeInteger(value)) {
    throw new PlayerLookupError('upstream', message);
  }

  return value;
}

function parseCompetitiveMatch(
  value: unknown,
  playerPuuid: string,
): CompetitiveMatchInput | null {
  const match = requiredRecord(value, 'HenrikDev returned an invalid match.');
  const metadata = requiredRecord(
    match.metadata,
    'HenrikDev returned match metadata in an unexpected format.',
  );
  const map = requiredRecord(
    metadata.map,
    'HenrikDev returned a match without a map.',
  );
  const players = match.players;
  const teams = match.teams;

  if (!Array.isArray(players) || !Array.isArray(teams)) {
    throw new PlayerLookupError(
      'upstream',
      'HenrikDev returned a match without player or team data.',
    );
  }

  const player = players.find(
    (candidate) => isRecord(candidate) && candidate.puuid === playerPuuid,
  );
  if (!player) {
    return null;
  }

  const teamId = requiredString(
    player,
    'team_id',
    'HenrikDev returned a player without a team.',
  );
  const team = teams.find(
    (candidate) => isRecord(candidate) && candidate.team_id === teamId,
  );
  if (!team) {
    throw new PlayerLookupError(
      'upstream',
      'HenrikDev returned a match without the player team.',
    );
  }

  const stats = requiredRecord(
    player.stats,
    'HenrikDev returned a player without match statistics.',
  );
  const agent = requiredRecord(
    player.agent,
    'HenrikDev returned a player without an agent.',
  );
  const rounds = requiredRecord(
    team.rounds,
    'HenrikDev returned a team without round totals.',
  );
  const damage = requiredRecord(
    stats.damage,
    'HenrikDev returned a player without damage statistics.',
  );
  const roundsWon = requiredNonNegativeInteger(
    rounds,
    'won',
    'HenrikDev returned an invalid score.',
  );
  const roundsLost = requiredNonNegativeInteger(
    rounds,
    'lost',
    'HenrikDev returned an invalid score.',
  );
  const hitCount =
    requiredNonNegativeInteger(
      stats,
      'headshots',
      'HenrikDev returned invalid hit statistics.',
    ) +
    requiredNonNegativeInteger(
      stats,
      'bodyshots',
      'HenrikDev returned invalid hit statistics.',
    ) +
    requiredNonNegativeInteger(
      stats,
      'legshots',
      'HenrikDev returned invalid hit statistics.',
    );
  const roundsPlayed = roundsWon + roundsLost;
  const teamWon = team.won;

  if (typeof teamWon !== 'boolean') {
    throw new PlayerLookupError(
      'upstream',
      'HenrikDev returned an invalid match outcome.',
    );
  }

  return {
    id: requiredString(
      metadata,
      'match_id',
      'HenrikDev returned a match without an ID.',
    ),
    startedAt: requiredString(
      metadata,
      'started_at',
      'HenrikDev returned a match without a start time.',
    ),
    mapName: requiredString(
      map,
      'name',
      'HenrikDev returned a match without a map name.',
    ),
    agentName: requiredString(
      agent,
      'name',
      'HenrikDev returned a player without an agent name.',
    ),
    outcome: roundsWon === roundsLost ? 'draw' : teamWon ? 'win' : 'loss',
    score: { won: roundsWon, lost: roundsLost },
    stats: {
      kills: requiredNonNegativeInteger(
        stats,
        'kills',
        'HenrikDev returned invalid kill statistics.',
      ),
      deaths: requiredNonNegativeInteger(
        stats,
        'deaths',
        'HenrikDev returned invalid death statistics.',
      ),
      assists: requiredNonNegativeInteger(
        stats,
        'assists',
        'HenrikDev returned invalid assist statistics.',
      ),
      averageCombatScore:
        roundsPlayed === 0
          ? 0
          : Math.round(
              requiredNonNegativeInteger(
                stats,
                'score',
                'HenrikDev returned invalid score statistics.',
              ) / roundsPlayed,
            ),
      averageDamagePerRound:
        roundsPlayed === 0
          ? 0
          : Math.round(
              requiredNonNegativeInteger(
                damage,
                'dealt',
                'HenrikDev returned invalid damage statistics.',
              ) / roundsPlayed,
            ),
      headshots: requiredNonNegativeInteger(
        stats,
        'headshots',
        'HenrikDev returned invalid hit statistics.',
      ),
      totalHits: hitCount,
      headshotPercentage:
        hitCount === 0
          ? 0
          : Math.round(
              (requiredNonNegativeInteger(
                stats,
                'headshots',
                'HenrikDev returned invalid hit statistics.',
              ) /
                hitCount) *
                1000,
            ) / 10,
      firstBloods: optionalNonNegativeInteger(
        stats,
        'first_bloods',
        'HenrikDev returned invalid first-blood statistics.',
      ),
    },
  };
}

function parseCompetitiveMatches(
  value: unknown,
  playerPuuid: string,
): CompetitiveMatchPage {
  const response = requiredRecord(
    value,
    'HenrikDev returned an unexpected match response.',
  );
  if (!Array.isArray(response.data)) {
    throw new PlayerLookupError(
      'upstream',
      'HenrikDev returned match data in an unexpected format.',
    );
  }

  return {
    returnedMatchCount: response.data.length,
    matches: response.data.flatMap((match) => {
      try {
        const parsedMatch = parseCompetitiveMatch(match, playerPuuid);
        return parsedMatch ? [parsedMatch] : [];
      } catch {
        return [];
      }
    }),
  };
}

export async function fetchPlayerProfile(
  name: string,
  tag: string,
  fetchFn: typeof fetch = fetch,
  apiKey: string | undefined = env.VALORANT_API_KEY,
): Promise<PlayerProfile> {
  const validatedName = validateRiotIdPart(name, 'Riot ID name');
  const validatedTag = validateRiotIdPart(tag, 'Riot ID tag');

  if (!isNonEmptyString(apiKey)) {
    throw new PlayerLookupError(
      'upstream',
      'HenrikDev API access is not configured.',
    );
  }

  const url = new URL(
    `/valorant/v1/account/${encodeURIComponent(validatedName)}/${encodeURIComponent(validatedTag)}`,
    HENRIK_API_URL,
  );

  let response: Response;
  try {
    response = await fetchFn(url, {
      headers: { Authorization: apiKey },
    });
  } catch {
    throw new PlayerLookupError('upstream', 'HenrikDev could not be reached.');
  }

  if (response.status === 404) {
    throw new PlayerLookupError(
      'not-found',
      'No Valorant account matches that Riot ID.',
    );
  }

  if (!response.ok) {
    throw new PlayerLookupError(
      'upstream',
      'HenrikDev could not retrieve the account.',
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new PlayerLookupError('upstream', 'HenrikDev returned invalid JSON.');
  }

  const account = parseAccountResponse(body);
  return {
    puuid: account.data.puuid,
    riotId: {
      name: account.data.name,
      tag: account.data.tag,
    },
    region: account.data.region,
    accountLevel: account.data.account_level,
    card: account.data.card,
    lastUpdatedAt: account.data.last_update,
  };
}

export async function fetchCompetitiveMatches(
  profile: PlayerProfile,
  fetchFn: typeof fetch = fetch,
  apiKey: string | undefined = env.VALORANT_API_KEY,
): Promise<CompetitiveMatchInput[]> {
  if (!isNonEmptyString(apiKey)) {
    throw new PlayerLookupError(
      'upstream',
      'HenrikDev API access is not configured.',
    );
  }

  const matches: CompetitiveMatchInput[] = [];

  for (let start = 0; start < COMPETITIVE_MATCH_LIMIT; ) {
    const url = new URL(
      `/valorant/v4/matches/${encodeURIComponent(profile.region.toLowerCase())}/pc/${encodeURIComponent(profile.riotId.name)}/${encodeURIComponent(profile.riotId.tag)}`,
      HENRIK_API_URL,
    );
    url.searchParams.set('mode', 'competitive');
    url.searchParams.set('size', String(COMPETITIVE_MATCH_PAGE_SIZE));
    url.searchParams.set('start', String(start));

    let response: Response;
    try {
      response = await fetchFn(url, {
        headers: { Authorization: apiKey },
      });
    } catch {
      throw new PlayerLookupError(
        'upstream',
        'HenrikDev could not retrieve competitive matches.',
      );
    }

    if (response.status === 404) {
      return matches;
    }

    if (!response.ok) {
      throw new PlayerLookupError(
        'upstream',
        'HenrikDev could not retrieve competitive matches.',
      );
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new PlayerLookupError(
        'upstream',
        'HenrikDev returned invalid JSON.',
      );
    }

    const page = parseCompetitiveMatches(body, profile.puuid);
    matches.push(...page.matches);
    if (page.returnedMatchCount === 0) {
      return matches;
    }

    start += page.returnedMatchCount;
  }

  return matches;
}

export async function fetchPlayerDashboard(
  name: string,
  tag: string,
  fetchFn: typeof fetch = fetch,
  apiKey: string | undefined = env.VALORANT_API_KEY,
): Promise<PlayerDashboard> {
  const cacheKey = `${name.trim().toLocaleLowerCase()}#${tag.trim().toLocaleLowerCase()}`;
  const canUseCache = fetchFn === fetch;
  const cachedDashboard = canUseCache
    ? dashboardCache.get(cacheKey)
    : undefined;

  if (cachedDashboard && cachedDashboard.expiresAt > Date.now()) {
    return cachedDashboard.dashboard;
  }

  if (cachedDashboard) {
    dashboardCache.delete(cacheKey);
  }

  const profile = await fetchPlayerProfile(name, tag, fetchFn, apiKey);
  const matchInputs = await fetchCompetitiveMatches(profile, fetchFn, apiKey);
  const performance = buildCompetitivePerformance(matchInputs);
  const dashboard = {
    profile,
    ...performance,
  };

  if (canUseCache) {
    dashboardCache.set(cacheKey, {
      dashboard,
      expiresAt: Date.now() + DASHBOARD_CACHE_DURATION_MS,
    });
  }

  return dashboard;
}
