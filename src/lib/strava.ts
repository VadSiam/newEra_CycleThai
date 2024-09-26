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

export interface CyclingPaces {
  "10000_1_2": number;
  "10000_3_4": number;
  "7000_1_2": number;
  "7000_3_4": number;
  "5000_1_2": number;
  "5000_3_4": number;
  "4000_1_2": number;
  "4000_3_4": number;
  "3000_1_2": number;
  "3000_3_4": number;
  "2000_1_2": number;
  "2000_3_4": number;
  "1000_1_2": number;
  "1000_3_4": number;
  "500_1_2": number;
  "500_3_4": number;
}

export type distanceCategory = 500 | 1000 | 2000 | 3000 | 4000 | 5000 | 7000 | 10000;
export type combinedClimbCategory = '1_2' | '3_4';
export type distanceCategoryFull = `${distanceCategory}_${combinedClimbCategory}`;

export const defaultCategories: CyclingPaces = {
  "10000_1_2": 0, "10000_3_4": 0,
  "7000_1_2": 0, "7000_3_4": 0,
  "5000_1_2": 0, "5000_3_4": 0,
  "4000_1_2": 0, "4000_3_4": 0,
  "3000_1_2": 0, "3000_3_4": 0,
  "2000_1_2": 0, "2000_3_4": 0,
  "1000_1_2": 0, "1000_3_4": 0,
  "500_1_2": 0, "500_3_4": 0,
};

function getDistanceCategory(distance: number): distanceCategory | null {
  if (distance >= 400 && distance < 600) return 500;
  if (distance >= 600 && distance < 1400) return 1000;
  if (distance >= 1400 && distance < 2400) return 2000;
  if (distance >= 2400 && distance < 3400) return 3000;
  if (distance >= 3400 && distance < 4400) return 4000;
  if (distance >= 4400 && distance < 5800) return 5000;
  if (distance >= 5800 && distance < 9400) return 7000;
  if (distance >= 9400 && distance <= 12000) return 10000;
  return null;
}

function getCombinedClimbCategory(length: number, grade: number): combinedClimbCategory {
  const score = length * grade;
  if (score > 32000) return '1_2';
  return '3_4';
}

export function categorizeClimbingEfforts(efforts: StravaEffort[]): CyclingPaces {
  const categorizedEfforts: CyclingPaces = { ...defaultCategories };

  efforts.forEach(effort => {
    const elevationGain = (effort.segment?.elevation_high ?? 0) - (effort.segment?.elevation_low ?? 0);
    const averageGrade = effort.segment.average_grade || (elevationGain / effort.distance * 100);

    const distanceCategory = getDistanceCategory(effort.distance);
    if (!distanceCategory) return; // Skip if the distance doesn't fit our categories

    const climbCategory = getCombinedClimbCategory(effort.distance, averageGrade);
    const category: distanceCategoryFull = `${distanceCategory}_${climbCategory}`;

    const timeInMinutes = (effort?.elapsed_time ?? 0) / 60;
    const vam = timeInMinutes ? ((elevationGain * 60) / timeInMinutes) : 0;

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