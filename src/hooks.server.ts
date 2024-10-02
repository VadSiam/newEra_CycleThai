import { handle as authHandle } from "./auth";
// import { initializeDatabase } from './db/index';

// Initialize database when the server starts
// initializeDatabase()
//   .then(() => console.log('Database initialized successfully'))
//   .catch(error => console.error('Failed to initialize database:', error));

export const handle = async ({ event, resolve }) => {
  try {
    return await authHandle({ event, resolve });
  } catch (error) {
    console.error('Error in auth handle:', error);
    return await resolve(event);
  }
};
