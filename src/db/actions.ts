import { v4 as uuidv4 } from 'uuid';
import { supabase } from './index';

export async function saveClimbingEfforts(userId: string, stravaId: string, effortData: string) {
  // Check if a record with the given stravaId already exists
  const { data: existingEffort, error: fetchError } = await supabase
    .from('climbing_efforts')
    .select('id')
    .eq('strava_id', stravaId)
    .limit(1);

  if (fetchError) {
    console.error('Error checking existing climbing efforts:', fetchError);
    return false;
  }

  if (existingEffort && existingEffort.length > 0) {
    // Record already exists, don't insert a new one
    return false;
  }

  // Insert new record
  try {
    const { error } = await supabase
      .from('climbing_efforts')
      .insert({
        id: uuidv4(), // Generate a new UUID for the id field
        user_id: userId,
        strava_id: stravaId,
        effort_data: effortData,
      });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error saving climbing efforts:', error);
    return false;
  }
}