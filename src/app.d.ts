import '@auth/sveltekit';

declare module '@auth/sveltekit' {
	interface Session {
		accessToken: string;
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			stravaId?: string | null;
		}
	}
}

export { };

