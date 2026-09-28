import type { PlayerProfile } from './player-profile';

export type CompetitiveMatch = {
  id: string;
  startedAt: string;
  mapName: string;
  agentName: string;
  outcome: 'win' | 'loss' | 'draw';
  score: {
    won: number;
    lost: number;
  };
  stats: {
    kills: number;
    deaths: number;
    assists: number;
    averageCombatScore: number;
    averageDamagePerRound: number;
    headshots: number;
    totalHits: number;
    headshotPercentage: number;
    firstBloods: number | null;
  };
};

export type CompetitiveSummary = {
  matchCount: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  killDeathRatio: number;
  killAssistDeathRatio: number;
  averageCombatScore: number;
  averageDamagePerRound: number;
  headshotPercentage: number;
  averageKills: number;
  averageDeaths: number;
  averageAssists: number;
  mostPlayedAgent: string | null;
  mostPlayedMap: string | null;
};

export type PlayerDashboard = {
  profile: PlayerProfile;
  summary: CompetitiveSummary;
  matches: CompetitiveMatch[];
};

function round(value: number, decimals = 0): number {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function mostFrequent(values: string[]): string | null {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  let result: string | null = null;
  let highestCount = 0;
  for (const [value, count] of counts) {
    if (count > highestCount) {
      result = value;
      highestCount = count;
    }
  }

  return result;
}

export function summarizeCompetitiveMatches(
  matches: CompetitiveMatch[],
): CompetitiveSummary {
  const matchCount = matches.length;
  const totals = matches.reduce(
    (summary, match) => {
      const rounds = match.score.won + match.score.lost;
      summary.kills += match.stats.kills;
      summary.deaths += match.stats.deaths;
      summary.assists += match.stats.assists;
      summary.score += match.stats.averageCombatScore * rounds;
      summary.damage += match.stats.averageDamagePerRound * rounds;
      summary.rounds += rounds;
      summary.headshots += match.stats.headshots;
      summary.totalHits += match.stats.totalHits;
      if (match.outcome === 'win') summary.wins += 1;
      if (match.outcome === 'loss') summary.losses += 1;
      if (match.outcome === 'draw') summary.draws += 1;
      return summary;
    },
    {
      kills: 0,
      deaths: 0,
      assists: 0,
      score: 0,
      damage: 0,
      rounds: 0,
      headshots: 0,
      totalHits: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    },
  );

  return {
    matchCount,
    wins: totals.wins,
    losses: totals.losses,
    draws: totals.draws,
    winRate: matchCount === 0 ? 0 : round((totals.wins / matchCount) * 100, 1),
    killDeathRatio: round(totals.kills / Math.max(totals.deaths, 1), 2),
    killAssistDeathRatio: round(
      (totals.kills + totals.assists) / Math.max(totals.deaths, 1),
      2,
    ),
    averageCombatScore:
      totals.rounds === 0 ? 0 : round(totals.score / totals.rounds),
    averageDamagePerRound:
      totals.rounds === 0 ? 0 : round(totals.damage / totals.rounds),
    headshotPercentage:
      totals.totalHits === 0
        ? 0
        : round((totals.headshots / totals.totalHits) * 100, 1),
    averageKills: matchCount === 0 ? 0 : round(totals.kills / matchCount, 1),
    averageDeaths: matchCount === 0 ? 0 : round(totals.deaths / matchCount, 1),
    averageAssists:
      matchCount === 0 ? 0 : round(totals.assists / matchCount, 1),
    mostPlayedAgent: mostFrequent(matches.map((match) => match.agentName)),
    mostPlayedMap: mostFrequent(matches.map((match) => match.mapName)),
  };
}
