import { describe, expect, it } from 'vitest';
import {
  summarizeCompetitiveMatches,
  type CompetitiveMatch,
} from '../src/lib/player-dashboard';

const matches: CompetitiveMatch[] = [
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

describe('summarizeCompetitiveMatches', () => {
  it('calculates weighted and per-match competitive metrics', () => {
    expect(summarizeCompetitiveMatches(matches)).toEqual({
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
    expect(summarizeCompetitiveMatches([])).toMatchObject({
      matchCount: 0,
      winRate: 0,
      mostPlayedAgent: null,
      mostPlayedMap: null,
    });
  });
});
