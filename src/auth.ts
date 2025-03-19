import { AUTH_STRAVA_ID, AUTH_STRAVA_SECRET } from '$env/static/private';
import { SvelteKitAuth } from "@auth/sveltekit";
import Strava from "@auth/sveltekit/providers/strava";
import { eq } from 'drizzle-orm';
import { db, users } from './db';

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [
    Strava({
      clientId: AUTH_STRAVA_ID,
      clientSecret: AUTH_STRAVA_SECRET,
      authorization: {
        params: {
          scope: 'read,read_all,profile:read_all,activity:read,activity:read_all',
          prompt: 'consent'
        }
      }
    })
  ],
  secret: AUTH_STRAVA_SECRET,
  trustHost: true,
  callbacks: {
    async jwt({ token, account, profile }) {
      console.log('🚀 ~ token, account, profile:1', token)
      console.log('🚀 ~ token, account, profile:2', account)
      console.log('🚀 ~ token, account, profile:3', profile)
      if (account && profile) {
        token.accessToken = account.access_token;
        token.stravaId = profile.id;

        // Check if user exists, if not create a new one
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const existingUser = await db.select().from(users).where(eq(users.stravaId, profile.id));
        console.log('######🚀 ~ existingUser:', existingUser)
        if (existingUser.length === 0) {
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
        const user = await db.select().from(users).where(eq(users.stravaId, token.stravaId));
        if (user.length > 0) {
          session.user = {
            ...session.user,
            id: user[0].id,
            stravaId: user[0].stravaId,
            // Add any other fields you want to include in the session
          };
          console.log(`Session created for user with Strava ID: ${user[0].stravaId}`);
        }
      }
      session.accessToken = token.accessToken as string;
      return session;
    },
  }
});