import { SvelteKitAuth } from "@auth/sveltekit";
import Strava from "@auth/sveltekit/providers/strava";
import { eq } from 'drizzle-orm';
import { db, users } from './db';

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [
    Strava({
      authorization: {
        params: {
          scope: 'read,read_all,profile:read_all,activity:read,activity:read_all',
          prompt: 'consent'
        }
      }
    })
  ],
  trustHost: true,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.stravaId = profile.id;

        // Check if user exists, if not create a new one
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const existingUser = await db.select().from(users).where(eq(users.stravaId, profile.id)).get();
        console.log('######🚀 ~ existingUser:', existingUser)
        if (!existingUser) {
          await db.insert(users).values({
            id: profile.id ?? '',
            name: profile.name ?? '',
            email: profile.email ?? '',
            stravaId: profile.id,
          });
          console.log(`New user created with Strava ID: ${profile.id}`);
        } else {
          console.log(`Existing user found with Strava ID: ${profile.id}`);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.stravaId) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const user = await db.select().from(users).where(eq(users.stravaId, token.stravaId)).get();
        if (user) {
          session.user = {
            ...session.user,
            id: user.id,
            stravaId: user.stravaId,
            // Add any other fields you want to include in the session
          };
          console.log(`Session created for user with Strava ID: ${user.stravaId}`);
        }
      }
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});