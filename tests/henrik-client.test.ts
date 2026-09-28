import { describe, expect, it, vi } from 'vitest';
import {
  fetchCompetitiveMatches,
  fetchPlayerProfile,
  PlayerLookupError,
} from '../src/lib/server/valorant/henrik-client';

const accountResponse = {
  status: 200,
  data: {
    puuid: 'player-id',
    region: 'eu',
    account_level: 42,
    name: 'Player Name',
    tag: 'EUW',
    card: {
      id: 'card-id',
      small: 'https://example.com/small.png',
      large: 'https://example.com/large.png',
      wide: 'https://example.com/wide.png',
    },
    last_update: '10 minutes ago',
  },
};

const playerProfile = {
  puuid: 'player-id',
  riotId: { name: 'Player Name', tag: 'EUW' },
  region: 'eu',
  accountLevel: 42,
  card: accountResponse.data.card,
  lastUpdatedAt: '10 minutes ago',
};

const competitiveMatchResponse = {
  status: 200,
  data: [
    {
      metadata: {
        match_id: 'match-id',
        started_at: '2026-09-28T10:00:00Z',
        map: { name: 'Ascent' },
      },
      players: [
        {
          puuid: 'player-id',
          team_id: 'Blue',
          agent: { name: 'Jett' },
          stats: {
            kills: 20,
            deaths: 15,
            assists: 5,
            score: 5000,
            headshots: 20,
            bodyshots: 30,
            legshots: 10,
            first_bloods: 4,
            damage: { dealt: 3000 },
          },
        },
      ],
      teams: [
        {
          team_id: 'Blue',
          won: true,
          rounds: { won: 13, lost: 7 },
        },
      ],
    },
  ],
};

describe('fetchPlayerProfile', () => {
  it('encodes the Riot ID and maps a valid upstream response', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify(accountResponse), { status: 200 }),
      );

    await expect(
      fetchPlayerProfile('Player Name', 'EUW', fetchFn, 'test-api-key'),
    ).resolves.toEqual({
      puuid: 'player-id',
      riotId: { name: 'Player Name', tag: 'EUW' },
      region: 'eu',
      accountLevel: 42,
      card: accountResponse.data.card,
      lastUpdatedAt: '10 minutes ago',
    });
    expect(fetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'https://api.henrikdev.xyz/valorant/v1/account/Player%20Name/EUW',
      }),
      { headers: { Authorization: 'test-api-key' } },
    );
  });

  it('rejects an empty Riot ID before making an upstream request', async () => {
    const fetchFn = vi.fn<typeof fetch>();

    await expect(
      fetchPlayerProfile(' ', 'EUW', fetchFn, 'test-api-key'),
    ).rejects.toMatchObject({
      kind: 'invalid-input',
    } satisfies Partial<PlayerLookupError>);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('rejects incomplete upstream data', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ status: 200, data: { puuid: 'player-id' } }),
          { status: 200 },
        ),
      );

    await expect(
      fetchPlayerProfile('Player', 'EUW', fetchFn, 'test-api-key'),
    ).rejects.toMatchObject({
      kind: 'upstream',
    } satisfies Partial<PlayerLookupError>);
  });

  it('returns a not-found error for a missing player', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 404 }));

    await expect(
      fetchPlayerProfile('Player', 'EUW', fetchFn, 'test-api-key'),
    ).rejects.toMatchObject({
      kind: 'not-found',
    } satisfies Partial<PlayerLookupError>);
  });

  it('fails without a configured API key before making an upstream request', async () => {
    const fetchFn = vi.fn<typeof fetch>();

    await expect(
      fetchPlayerProfile('Player', 'EUW', fetchFn, ''),
    ).rejects.toMatchObject({
      kind: 'upstream',
      message: 'HenrikDev API access is not configured.',
    } satisfies Partial<PlayerLookupError>);
    expect(fetchFn).not.toHaveBeenCalled();
  });
});

describe('fetchCompetitiveMatches', () => {
  it('requests the last 20 competitive matches and maps the player metrics', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(competitiveMatchResponse), {
        status: 200,
      }),
    );

    await expect(
      fetchCompetitiveMatches(playerProfile, fetchFn, 'test-api-key'),
    ).resolves.toEqual([
      {
        id: 'match-id',
        startedAt: '2026-09-28T10:00:00Z',
        mapName: 'Ascent',
        agentName: 'Jett',
        outcome: 'win',
        score: { won: 13, lost: 7 },
        stats: {
          kills: 20,
          deaths: 15,
          assists: 5,
          averageCombatScore: 250,
          averageDamagePerRound: 150,
          headshots: 20,
          totalHits: 60,
          headshotPercentage: 33.3,
          firstBloods: 4,
        },
      },
    ]);
    expect(fetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'https://api.henrikdev.xyz/valorant/v4/matches/eu/pc/Player%20Name/EUW?mode=competitive&size=20',
      }),
      { headers: { Authorization: 'test-api-key' } },
    );
  });
});
