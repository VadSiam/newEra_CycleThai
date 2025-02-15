import { AUTH_GARMIN_ID, AUTH_GARMIN_SECRET, AUTH_STRAVA_ID, AUTH_STRAVA_SECRET } from '$env/static/private';
import { SvelteKitAuth } from "@auth/sveltekit";
import Strava from "@auth/sveltekit/providers/strava";
import { eq } from 'drizzle-orm';
import Garmin from "./authProviders/garmin";
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
    }),
    Garmin({
      clientId: AUTH_GARMIN_ID,
      clientSecret: AUTH_GARMIN_SECRET,
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
      if (account && profile) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
        token.stravaId = profile.id;
        token.garminId = account.provider === 'garmin' ? profile.id : null;

        const existingUser = await db.select().from(users).where(
          account.provider === 'strava'
            ? eq(users.stravaId, profile.id!)
            : eq(users.garminId, profile.id!)
        );

        if (existingUser.length === 0) {
          await db.insert(users).values({
            id: profile.id ?? '',
            name: profile.name ?? '',
            email: profile.email ?? '',
            stravaId: account.provider === 'strava' ? profile.id : null,
            garminId: account.provider === 'garmin' ? profile.id : null,
          });
        }
      }
      return token;
    },
    async session({ session, token }) {

      if (token.stravaId || token.garminId) {
        const user = await db.select().from(users).where(
          token.stravaId
            ? eq(users.stravaId, token.stravaId)
            : eq(users.garminId, token.garminId)
        );

        if (user.length > 0) {
          session.user = {
            ...session.user,
            id: user[0].id,
            stravaId: user[0].stravaId,
            garminId: user[0].garminId,
          };
        }
      }
      session.accessToken = token.accessToken as string;
      return session;
    },
  }
});