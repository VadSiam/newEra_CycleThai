import { SvelteKitAuth } from "@auth/sveltekit";
import Strava from "@auth/sveltekit/providers/strava";

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
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.stravaId = profile.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.stravaId = token.stravaId;
      return session;
    },
  },
})