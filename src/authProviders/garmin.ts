import type { OAuthConfig, OAuthUserConfig } from '@auth/core/providers';

export interface GarminProfile {
  id: string;
  name: string;
  email: string;
}

export default function Garmin<P extends GarminProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "garmin",
    name: "Garmin",
    type: "oauth",
    authorization: {
      url: "https://connect.garmin.com/oauthConfirm",
      params: { scope: "" }
    },
    token: {
      url: "https://connect.garmin.com/oauthService/token",
    },
    userinfo: {
      url: "https://connect.garmin.com/modern/proxy/user-service/socialProfile",
      async request({ tokens, client }) {
        const response = await fetch("https://connect.garmin.com/modern/proxy/user-service/socialProfile", {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });
        const profile = await response.json();
        return profile;
      },
    },
    profile(profile) {
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
      };
    },
    style: {
      logo: "/garmin-logo.png",
      // logoDark: "/garmin-logo-dark.svg",
      bg: "#000000",
      text: "#ffffff",
      // bgDark: "#000000",
      // textDark: "#ffffff",
    },
    // options,
  };
}