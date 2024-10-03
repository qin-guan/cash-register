// server/api/users/auth/setupAdmin.ts
import { defineEventHandler, createError, readBody } from 'h3';
import { initializeDatabase, User } from '../users-db';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event);

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Username and password are required' });
  }

  const db = await initializeDatabase();

  // Check if there are any users in the database
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  
  if (userCount.count > 0) {
    throw createError({ statusCode: 403, statusMessage: 'Admin account already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.run(
    'INSERT INTO users (username, password, is_admin, is_approved, needs_password_reset) VALUES (?, ?, 1, 1, 0)',
    [username, hashedPassword]
  );

  return { success: true };
});
