import { categorizeClimbingEfforts, getLastThreeActivities, getSegmentsForActivity } from '$lib/strava';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth()
  if (!session) {
    throw redirect(307, '/');
  }

  if (!session.accessToken) {
    throw error(500, 'No access token found in session');
  }

  return { session };
};

export const actions = {
  fetchActivities: async ({ locals }) => {
    const session = await locals.auth()
    if (!session || !session.accessToken) {
      throw error(500, 'No access token found in session');
    }

    try {
      const activities = await getLastThreeActivities(session.accessToken);
      console.log('@@@@@@@@@@@🚀 ~ activities:', activities)

      // Fetch segments for each activity
      const segmentsPromises = activities.map(activity =>
        getSegmentsForActivity(session.accessToken, activity.id)
      );
      const segmentsResponses = await Promise.all(segmentsPromises);

      // Flatten and remove duplicates
      const uniqueSegments = Array.from(new Set(segmentsResponses.flat()));

      // Categorize climbing efforts
      const climbingEfforts = categorizeClimbingEfforts(uniqueSegments);

      return {
        activities,
        climbingEfforts
      };
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      }
      throw error(500, 'Failed to get data');
    }
  }
};