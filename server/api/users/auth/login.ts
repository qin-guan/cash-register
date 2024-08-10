import { defineEventHandler, readBody, createError } from 'h3';
import jwt from 'jsonwebtoken';
import db, { User, secretKey } from '../users-db';

export default defineEventHandler(async (event) => {
  try {
    const { username, password } = await readBody(event);
    let user: User | undefined;

    const existingUser = await db.all(`SELECT * FROM users WHERE username = ?;`, username) as User[];
    
    if (existingUser.length > 0) {
      user = existingUser[0];
      if (user.password !== password) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
      }
      if (!user.is_admin && !user.is_approved) {
        throw createError({ statusCode: 403, statusMessage: 'Account not approved by admin' });
      }
    } else {
      const users = await db.all('SELECT * FROM users');
      const maxIdResult = await db.all("SELECT COALESCE(MAX(id), 0) as max_id FROM users");
      const nextId = maxIdResult[0].max_id + 1;
      const isFirstUser = users.length === 0;
      const isApproved = isFirstUser;
    
      await db.run(`INSERT INTO users (id, username, password, is_admin, is_approved) VALUES (?, ?, ?, ?, ?);`, nextId, username, password, isFirstUser, isApproved);
      
      user = (await db.all(`SELECT * FROM users WHERE username = ?;`, username) as User[])[0];
      throw createError({ statusCode: 403, statusMessage: 'Account not approved by admin' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username, isAdmin: user.is_admin }, secretKey, { expiresIn: '1h' });
    return { token, isAdmin: user.is_admin };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
});
