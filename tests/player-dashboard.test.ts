import { describe, expect, it } from 'vitest';
import {
  buildCompetitivePerformance,
  type CompetitiveMatchInput,
} from '../src/lib/player-dashboard';

const matches: CompetitiveMatchInput[] = [
  {
    id: 'one',
    startedAt: '2026-09-28T10:00:00Z',
    mapName: 'Ascent',
    agentName: 'Jett',
    outcome: 'win',
    score: { won: 13, lost: 9 },
    stats: {
      kills: 20,
      deaths: 15,
      assists: 5,
      averageCombatScore: 250,
      averageDamagePerRound: 150,
      headshots: 25,
      totalHits: 100,
      headshotPercentage: 25,
      firstBloods: 4,
    },
  },
  {
    id: 'two',
    startedAt: '2026-09-27T10:00:00Z',
    mapName: 'Ascent',
    agentName: 'Jett',
    outcome: 'loss',
    score: { won: 7, lost: 13 },
    stats: {
      kills: 10,
      deaths: 20,
      assists: 10,
      averageCombatScore: 180,
      averageDamagePerRound: 100,
      headshots: 15,
      totalHits: 100,
      headshotPercentage: 15,
      firstBloods: null,
    },
  },
];

describe('buildCompetitivePerformance', () => {
  it('builds a chronological five-match First Blood Rate history', () => {
    const firstBloodMatches = [0, 1, 2, 3, 4, 5].map(
      (firstBloods, index): CompetitiveMatchInput => ({
        ...matches[0],
        id: `first-blood-${index}`,
        startedAt: `2026-09-${String(28 - index).padStart(2, '0')}T10:00:00Z`,
        score: { won: 10, lost: 10 },
        stats: { ...matches[0].stats, firstBloods },
      }),
    );

    const firstBloodHistory =
      buildCompetitivePerformance(firstBloodMatches).firstBloodHistory;

    expect(firstBloodHistory).toMatchObject({
      matchCount: 6,
      roundCount: 120,
    });
    expect(firstBloodHistory.trend[0]).toMatchObject({
      matchId: 'first-blood-5',
      firstBloods: 5,
      rounds: 20,
      rate: 25,
      windowMatchCount: 1,
    });
    expect(firstBloodHistory.trend.at(-1)).toMatchObject({
      matchId: 'first-blood-0',
      firstBloods: 0,
      rounds: 20,
      rate: 10,
      windowMatchCount: 5,
    });
  });

  it('excludes matches without First Blood data from First Blood history', () => {
    expect(
      buildCompetitivePerformance(matches).firstBloodHistory,
    ).toMatchObject({
      matchCount: 1,
      roundCount: 22,
      trend: [
        {
          matchId: 'one',
          firstBloods: 4,
          rounds: 22,
          rate: 18.2,
        },
      ],
    });
  });

  it('derives per-match KDA for dashboard callers', () => {
    expect(buildCompetitivePerformance(matches).matches).toMatchObject([
      {
        id: 'one',
        stats: {
          averageCombatScore: 250,
          averageDamagePerRound: 150,
          totalHits: 100,
          headshotPercentage: 25,
          killAssistDeathRatio: 1.67,
        },
      },
      {
        id: 'two',
        stats: {
          averageCombatScore: 180,
          averageDamagePerRound: 100,
          totalHits: 100,
          headshotPercentage: 15,
          killAssistDeathRatio: 1,
        },
      },
    ]);
  });

  it('uses one as the KDA denominator when a match has no deaths', () => {
    const undefeatedMatch: CompetitiveMatchInput = {
      ...matches[0],
      stats: { ...matches[0].stats, kills: 12, deaths: 0, assists: 8 },
    };

    expect(
      buildCompetitivePerformance([undefeatedMatch]).matches[0].stats
        .killAssistDeathRatio,
    ).toBe(20);
  });

  it('calculates weighted and per-match competitive metrics', () => {
    expect(buildCompetitivePerformance(matches).summary).toEqual({
      matchCount: 2,
      wins: 1,
      losses: 1,
      draws: 0,
      winRate: 50,
      killDeathRatio: 0.86,
      killAssistDeathRatio: 1.29,
      averageCombatScore: 217,
      averageDamagePerRound: 126,
      headshotPercentage: 20,
      averageKills: 15,
      averageDeaths: 17.5,
      averageAssists: 7.5,
      mostPlayedAgent: 'Jett',
      mostPlayedMap: 'Ascent',
    });
  });

  it('returns zero metrics for an empty history', () => {
    expect(buildCompetitivePerformance([]).summary).toMatchObject({
      matchCount: 0,
      winRate: 0,
      mostPlayedAgent: null,
      mostPlayedMap: null,
    });
  });
});
