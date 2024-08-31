import { categorizeClimbingEfforts, getLastActivities, getSegmentsForActivity } from '$lib/strava';
import { error, redirect } from '@sveltejs/kit';
import { saveClimbingEfforts } from '../../db/actions';
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
      const activities = await getLastActivities(session.accessToken);
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

      // Save climbing efforts to the database
      let effortsSaved;
      if (session.user.stravaId) {
        effortsSaved = await saveClimbingEfforts(
          session.user.id,
          session.user.stravaId,
          JSON.stringify(climbingEfforts)
        );
      } else {
        effortsSaved = climbingEfforts;
      }

      return {
        activities,
        climbingEfforts,
        effortsSaved,
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