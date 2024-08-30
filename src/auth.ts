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
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
})