import stravaApi from 'strava-v3';
import { updateUserLastActivityDate } from '../db';

function getOneWeekAgoTimestamp(): number {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return Math.floor(oneWeekAgo.getTime() / 1000);
}

export async function getLastActivities(accessToken: string, userId: string, lastActivityRecordDate?: Date | null): Promise<any[]> {
  const strava = new (stravaApi.client as any)(accessToken);

  try {
    const after = lastActivityRecordDate
      ? Math.floor(lastActivityRecordDate.getTime() / 1000)
      : getOneWeekAgoTimestamp();

    const payload = await strava.athlete.listActivities({
      after,
      per_page: 30,
    });

    // Update lastActivityRecordDate in the database
    if (payload.length > 0) {
      const latestActivityDate = new Date(payload[0].start_date);
      await updateUserLastActivityDate(userId, latestActivityDate);
    }

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
  distance: number; // in meters
  elapsed_time: number; // in seconds
  segment: {
    elevation_high: number;
    elevation_low: number;
    climb_category: number;
    average_grade: number;
  };
};

function getNearestCategory(distance: number, categories: number[]): number {
  return categories.reduce((prev, curr) =>
    Math.abs(curr - distance) < Math.abs(prev - distance) ? curr : prev
  );
}

export interface CyclingPaces {
  "10000": number;
  "10000s": number; // Added steep category
  "6000": number;
  "6000s": number; // Added steep category
  "3000": number;
  "3000s": number; // Added steep category
  "1000": number;
  "1000s": number; // Added steep category
  "500": number;
  "500s": number; // Added steep category
  "200": number;
  "200s": number; // Added steep category
}

export type distanceCategory = 200 | 500 | 1000 | 3000 | 6000 | 10000;
export type distanceCategoryFull = 200 | 500 | 1000 | 3000 | 6000 | 10000 | '200s' | '500s' | '1000s' | '3000s' | '6000s' | '10000s';

export const defaultCategories = {
  "10000": 0,
  "10000s": 0, // Added steep category
  "6000": 0,
  "6000s": 0, // Added steep category
  "3000": 0,
  "3000s": 0, // Added steep category
  "1000": 0,
  "1000s": 0, // Added steep category
  "500": 0,
  "500s": 0, // Added steep category
  "200": 0,
  "200s": 0, // Added steep category
}

export function categorizeClimbingEfforts(efforts: StravaEffort[]): CyclingPaces {
  const distanceCategories: distanceCategory[] = [200, 500, 1000, 3000, 6000, 10000];
  const categorizedEfforts: CyclingPaces = { ...defaultCategories };

  efforts.forEach(effort => {
    const elevationGain = (effort.segment?.elevation_high ?? 0) - (effort.segment?.elevation_low ?? 0);
    const averageGrade = effort.segment.average_grade || (elevationGain / effort.distance * 100);
    const isGradeSteep = averageGrade > 8; // Identifies if the grade is steep

    if ((effort.segment?.climb_category <= 0) || (elevationGain < 20)) {
      return;
    }

    const timeInMinutes = (effort?.elapsed_time ?? 0) / 60;
    const vam = timeInMinutes ? ((elevationGain * 60) / timeInMinutes) : 0; // VAM calculation

    // Choose category based on steepness
    const baseCategory: distanceCategory = getNearestCategory(effort?.distance, distanceCategories);
    const categorySuffix = isGradeSteep ? 's' : '';
    const category: distanceCategoryFull = `${baseCategory}${categorySuffix}` as distanceCategoryFull;

    const currentBestVAM = categorizedEfforts[category] || 0;
    if (vam > currentBestVAM && vam <= 3000) { // Filter unrealistic VAM values
      categorizedEfforts[category] = +vam.toFixed(2);
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