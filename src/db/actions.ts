import { eq } from 'drizzle-orm';
import { climbingEfforts, db } from './index';


export async function saveClimbingEfforts(userId: string, stravaId: string, effortData: string) {
  const existingUser = await db.select().from(climbingEfforts).where(eq(climbingEfforts.stravaId, stravaId)).limit(1);

  if (existingUser.length === 0) {
    await db.insert(climbingEfforts).values({
      userId,
      stravaId,
      effortData,
    });
    return true;
  }

  return false;
}