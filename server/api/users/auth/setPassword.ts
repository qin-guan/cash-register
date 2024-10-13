// server/api/users/auth/setPassword.ts
import { defineEventHandler, createError, readBody } from 'h3';
import { initializeDatabase, User } from '../users-db';

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event);

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'User ID and password are required' });
  }

  const db = await initializeDatabase();
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]) as User;

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' });
  }

  // Store the password as plain text instead of hashing
  await db.run(
    'UPDATE users SET password = ?, is_approved = ? WHERE username = ?',
    [password, 1, username]
  );

  return { success: true };
});
