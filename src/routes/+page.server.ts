import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const session = await locals.auth();
  if (session) {
    // Only redirect if we're not already on the dashboard
    if (url.pathname !== '/dashboard') {
      throw redirect(307, '/dashboard');
    }
  }
  return {};
};