import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../src/routes/api/players/[name]/[tag]/+server';

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

afterEach(() => vi.unstubAllGlobals());

function requestPlayer(name: string, tag: string) {
  return GET({ params: { name, tag } } as Parameters<typeof GET>[0]);
}

describe('GET /api/players/[name]/[tag]', () => {
  it('returns the mapped player profile', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(JSON.stringify(accountResponse), { status: 200 }),
        ),
    );

    const response = await requestPlayer('Player%20Name', 'EUW');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: expect.objectContaining({
        puuid: 'player-id',
        riotId: { name: 'Player Name', tag: 'EUW' },
      }),
    });
  });

  it('rejects an invalid player name without calling HenrikDev', async () => {
    const fetchFn = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchFn);

    const response = await requestPlayer(' ', 'EUW');

    expect(response.status).toBe(400);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('returns not found when HenrikDev cannot find the account', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 404 })),
    );

    const response = await requestPlayer('Missing', 'EUW');

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'No Valorant account matches that Riot ID.',
    });
  });
});
