// server/api/users/auth/setPassword.ts
import { defineEventHandler, createError, readBody } from 'h3';
import { initializeDatabase, User } from '../users-db';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  const { userId, password } = await readBody(event);

  if (!userId || !password) {
    throw createError({ statusCode: 400, statusMessage: 'User ID and password are required' });
  }

  const db = await initializeDatabase();
  const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]) as User;

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' });
  }

  if (!user.needs_password_reset) {
    throw createError({ statusCode: 400, statusMessage: 'Password reset not required for this user' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.run(
    'UPDATE users SET password = ?, needs_password_reset = 0 WHERE id = ?',
    [hashedPassword, userId]
  );

  return { success: true };
});
