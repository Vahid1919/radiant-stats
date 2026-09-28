import { json } from '@sveltejs/kit';
import {
  fetchPlayerProfile,
  PlayerLookupError,
} from '$lib/server/valorant/henrik-client';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const profile = await fetchPlayerProfile(params.name, params.tag);
    return json({ data: profile });
  } catch (error) {
    if (error instanceof PlayerLookupError) {
      const status =
        error.kind === 'invalid-input'
          ? 400
          : error.kind === 'not-found'
            ? 404
            : 502;
      return json({ error: error.message }, { status });
    }

    return json(
      { error: 'The player profile could not be retrieved.' },
      { status: 502 },
    );
  }
};
