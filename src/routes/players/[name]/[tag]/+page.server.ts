import { error } from '@sveltejs/kit';
import {
  fetchPlayerDashboard,
  PlayerLookupError,
} from '$lib/server/valorant/henrik-client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  try {
    return { dashboard: await fetchPlayerDashboard(params.name, params.tag) };
  } catch (caughtError) {
    if (caughtError instanceof PlayerLookupError) {
      const status =
        caughtError.kind === 'invalid-input'
          ? 400
          : caughtError.kind === 'not-found'
            ? 404
            : 502;
      error(status, caughtError.message);
    }

    error(502, 'The player dashboard could not be retrieved.');
  }
};
