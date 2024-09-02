import { categorizeClimbingEfforts, getLastActivities, getSegmentsForActivity } from '$lib/strava';
import { error, redirect } from '@sveltejs/kit';
import { saveClimbingEfforts } from '../../db/actions';
import type { PageServerLoad } from './$types';

type UserHere = {
  id: string;
  name?: string | null;
  email?: string | null;
  stravaId?: string | null;
  lastActivityRecordDate?: Date | null; // Add this line
};

export const load: PageServerLoad = async ({ locals, cookies }) => {
  const session = await locals.auth();
  if (!session || !cookies.get('authjs.session-token')) {
    throw redirect(307, '/');
  }

  if (!session.accessToken) {
    throw error(500, 'No access token found in session');
  }

  return { session };
};

export const actions = {
  fetchActivities: async ({ locals, cookies }) => {
    const session = await locals.auth();
    if (!session || !session.accessToken) {
      console.error(500, 'No access token found in session. fetchActivities function');
      redirect(307, '/');
    }

    try {
      const user: UserHere = session.user; // Type assertion
      const activities = await getLastActivities(session.accessToken, user.id, user.lastActivityRecordDate);
      console.log('@@@@@@@@@@@🚀 ~ activities:', activities);

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

      // Check for the specific error
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);

        if (err.message.includes('Authorization Error') ||
          (err as any).statusCode === 401 ||
          err.message.includes('access_token') && err.message.includes('invalid')) {
          cookies.set('authjs.session-token', '', { path: '/', maxAge: 0 }); // Clear the session cookie
          throw redirect(307, '/'); // Redirect to the home page
        } else if (err.message.includes('No access token found in session') || (err as any).statusCode === 500 || (err as any).statusCode === '500') {
          throw redirect(307, '/'); // Redirect to the home page
        }
      }

      throw error(500, 'Failed to get data');
    }
  }
};