import '@auth/sveltekit';

declare module '@auth/sveltekit' {
	interface Session {
		provider: string;
		accessToken: string;
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			stravaId?: string | null;
			garminId?: string | null;
		}
	}
}

export { };

