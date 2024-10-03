// server/api/users/auth/checkFirstUser.ts
import { defineEventHandler } from 'h3';
import { initializeDatabase } from '../users-db';

export default defineEventHandler(async (event) => {
  const db = await initializeDatabase();
  
  // Check if there are any users in the database
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  
  return { isFirstUser: userCount.count === 0 };
});
