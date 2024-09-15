import { defineEventHandler, readBody, createError } from 'h3';
import jwt from 'jsonwebtoken';
import { initializeDatabase, User, secretKey } from '../users-db';

export default defineEventHandler(async (event) => {
  try {
    const { username, password } = await readBody(event);
    const db = await initializeDatabase();

    let user: User | undefined;

    const existingUser = await db.get(`SELECT * FROM users WHERE username = ?`, username) as User;
    
    if (existingUser) {
      user = existingUser;
      if (user.password !== password) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
      }
      if (!user.is_admin && !user.is_approved) {
        throw createError({ statusCode: 403, statusMessage: 'Account not approved by admin' });
      }
    } else {
      const users = await db.all('SELECT * FROM users');
      const isFirstUser = users.length === 0;
      const isApproved = isFirstUser;
    
      const result = await db.run(`INSERT INTO users (username, password, is_admin, is_approved) VALUES (?, ?, ?, ?)`, username, password, isFirstUser, isApproved);
      
      user = await db.get(`SELECT * FROM users WHERE id = ?`, result.lastID) as User;
      if (!isApproved) {
        throw createError({ statusCode: 403, statusMessage: 'Account not approved by admin' });
      }
    }

    const token = jwt.sign({ userId: user.id, username: user.username, isAdmin: user.is_admin }, secretKey, { expiresIn: '1h' });
    return { token, isAdmin: user.is_admin };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
});
