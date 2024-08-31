import stravaApi from 'strava-v3';

export async function getLastActivities(accessToken: string): Promise<any[]> {
  const strava = new (stravaApi.client as any)(accessToken);

  try {
    const payload = await strava.athlete.listActivities({
      page: 1,
      per_page: 3,
    });

    return payload.map((activity: any) => ({
      id: activity.id,
      name: activity.name,
      distance: activity.distance,
      elapsed_time: activity.elapsed_time,
      elevation_gain: activity.total_elevation_gain,
      start_date: activity.start_date,
      type: activity.type,
    }));
  } catch (error) {
    console.error('Error fetching Strava activities:', error);
    throw error;
  }
}

export async function getSegmentsForActivity(accessToken: string, activityId: number): Promise<any[]> {
  const strava = new (stravaApi.client as any)(accessToken);

  try {
    const { segment_efforts } = await strava.activities.get({ 'id': activityId });

    if (segment_efforts && segment_efforts.length > 0) {
      const firstSegmentId = segment_efforts[0].segment.id;

      // Optionally, you can fetch leaderboard data if needed
      // const leaders = await strava.segments.listEfforts({
      //   id: firstSegmentId,
      //   // Uncomment and adjust date range if needed
      //   // start_date_local: today,
      //   // end_date_local: today 
      // });

      // console.log('🚀 ~ Leaders:', leaders.length);
    }

    console.log('🚀 ~ Segment efforts:', segment_efforts.length);
    return segment_efforts;
  } catch (error) {
    console.error('Error fetching segments for activity:', error);
    throw error;
  }
}

export async function getSegmentInfo(accessToken: string, segmentId: number): Promise<any> {
  const strava = new (stravaApi.client as any)(accessToken);

  try {
    const payload = await strava.segments.get({ id: segmentId });
    return payload;
  } catch (error) {
    console.error('Error fetching segment info:', error);
    throw error;
  }
}

type StravaEffort = {
  id: number;
  distance: number;
  elapsed_time: number;
  segment: {
    elevation_high: number;
    elevation_low: number;
    climb_category: number;
  };
};

function getNearestCategory(distance: number, categories: number[]): number {
  return categories.reduce((prev, curr) =>
    Math.abs(curr - distance) < Math.abs(prev - distance) ? curr : prev
  );
}

export function categorizeClimbingEfforts(efforts: StravaEffort[]): Record<string, number> {
  const distanceCategories = [200, 500, 1000, 3000, 6000, 10000];
  const categorizedEfforts: Record<string, number> = {};

  efforts.forEach(effort => {
    const elevationGain = effort.segment.elevation_high - effort.segment.elevation_low;

    if ((effort.segment.climb_category <= 0) || (elevationGain < 20)) {
      return;
    }

    const timeInMinutes = effort.elapsed_time / 60;
    const vam = (elevationGain * 60) / timeInMinutes;

    const category = getNearestCategory(effort.distance, distanceCategories);
    const currentBestVAM = categorizedEfforts[`${category}m`] || 0;
    if (vam > currentBestVAM && vam <= 2000) {
      categorizedEfforts[`${category}m`] = +vam.toFixed(2);
    }
  });

  return categorizedEfforts;
}

export function calculateVAM({ elevationHigh, elevationLow, timeInMinutes }: { elevationHigh: number; elevationLow: number; timeInMinutes: number }): number {
  if (timeInMinutes <= 0) {
    throw new Error("Time must be greater than zero");
  }

  const elevationGain = elevationHigh - elevationLow;
  return (elevationGain * 60) / timeInMinutes;
}