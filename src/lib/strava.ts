import stravaApi from 'strava-v3';
import { getActivitiesFromDB, saveActivitiesToDB, updateUserLastActivityDate } from '../db';

function getOneWeekAgoTimestamp(): number {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return Math.floor(oneWeekAgo.getTime() / 1000);
}
function get3DaysAgoTimestamp(): number {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  return Math.floor(threeDaysAgo.getTime() / 1000);
}

export async function getLastActivities(accessToken: string, userId: string): Promise<any[]> {
  const strava = new (stravaApi.client as any)(accessToken);

  try {
    // 1. Get activities from DB
    console.log('📊 Fetching activities from DB for user:', userId);
    const dbActivities = await getActivitiesFromDB(userId);
    console.log('📊 Found activities in DB:', dbActivities.length);

    // 2. Determine if we need to fetch from Strava
    let stravaActivities: any[] = [];
    if (dbActivities.length > 0) {
      // Get latest activity date from DB
      const latestDBActivity = dbActivities[0]; // Assuming sorted desc
      // const after = Math.floor(new Date(latestDBActivity.start_date).getTime() / 1000);
      console.log('🔍 Latest activity in DB date:', new Date(latestDBActivity.start_date));

      // Create a constant for one week ago (in seconds since Unix epoch)
      const after2 = get3DaysAgoTimestamp();
      console.log('📅 One week ago timestamp:', new Date(after2 * 1000));

      // Use after for incremental sync (only new activities since last known)
      // console.log('🚴 Fetching new activities from Strava after:', new Date(after * 1000));
      const newActivities = await strava.athlete.listActivities({
        after: after2,
        per_page: 30,
      });
      console.log('🚴 Found new activities from Strava:', newActivities.length);

      if (newActivities.length > 0) {
        console.log('💾 Saving new activities to DB...');
        // Save new activities to DB
        await saveActivitiesToDB(userId, newActivities);
        stravaActivities = newActivities;
        console.log('💾 Saved new activities to DB');
      }
    } else {
      // No activities in DB, fetch last 7 days
      console.log('📊 No activities in DB, fetching last 7 days from Strava');
      const after2 = get3DaysAgoTimestamp();
      stravaActivities = await strava.athlete.listActivities({
        after: after2,
        per_page: 30,
      });
      console.log('🚴 Found activities from Strava:', stravaActivities.length);

      // Save to DB
      if (stravaActivities.length > 0) {
        console.log('💾 Saving initial activities to DB...');
        await saveActivitiesToDB(userId, stravaActivities);
        console.log('💾 Saved initial activities to DB');
      }
    }

    // Update last activity date if we got new activities
    if (stravaActivities.length > 0) {
      const latestActivityDate = new Date(stravaActivities[0].start_date);
      console.log('📅 Updating last activity date to:', latestActivityDate);
      await updateUserLastActivityDate(userId, latestActivityDate);
    }

    // 3. Combine and format all activities
    const allActivities = [...stravaActivities, ...dbActivities];
    console.log('📊 Total activities before deduplication:', allActivities.length);

    // Sort by date desc and remove duplicates
    const uniqueActivities = Array.from(
      new Map(allActivities.map(item => [item.id, item])).values()
    ).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

    console.log('📊 Total unique activities after deduplication:', uniqueActivities.length);

    // Keep the same return format
    return uniqueActivities.map((activity: any) => ({
      id: activity.id,
      name: activity.name,
      distance: activity.distance,
      elapsed_time: activity.elapsed_time,
      elevation_gain: activity.total_elevation_gain,
      start_date: activity.start_date,
      type: activity.type,
    }));
  } catch (error) {
    console.error('❌ Error fetching activities:', error);
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
    if (!effort.segment) return;
    const elevationGain = (effort.segment?.elevation_high ?? 0) - (effort.segment?.elevation_low ?? 0);
    const averageGrade = effort.segment.average_grade;

    // Filter for climbing segments
    if (elevationGain <= 0 || averageGrade <= 0) return;

    const distanceCategory = getDistanceCategory(effort.distance);
    if (!distanceCategory) return; // Skip if the distance doesn't fit our categories

    const climbCategory = getCombinedClimbCategory(effort.distance, averageGrade);
    const category: distanceCategoryFull = `${distanceCategory}_${climbCategory}`;

    const timeInMinutes = (effort?.elapsed_time ?? 0) / 60;
    const vam = timeInMinutes ? calculateVAMbyGain({ elevationGain, timeInMinutes }) : 0;

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

export function calculateVAMbyGain({
  elevationGain,
  timeInMinutes
}: {
  elevationGain: number;
  timeInMinutes: number
}): number {
  if (timeInMinutes <= 0) {
    throw new Error("Time must be greater than zero");
  }

  if (elevationGain < 0) {
    throw new Error("Elevation gain must be non-negative");
  }

  const vam = (elevationGain * 60) / timeInMinutes;
  return Number(vam.toFixed(2)); // Rounds to 2 decimal places for consistency
}