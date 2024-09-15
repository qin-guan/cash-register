// users-db.ts
import { existsSync } from 'fs';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

const databasePath = path.join(process.cwd(), 'data', 'users.sqlite');
export const secretKey = process.env.AUTH_SECRET;

let db: Database;

export const initializeDatabase = async () => {
  if (!existsSync(databasePath)) {
    console.log("No existing Users Table found. Starting with empty table.");
  }

  db = await open({
    filename: databasePath,
    driver: sqlite3.Database
  });

  // Create table if not exists and add `is_approved` column
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE,
      password VARCHAR(50),
      is_admin BOOLEAN DEFAULT FALSE,
      is_approved BOOLEAN DEFAULT FALSE
    );
  `);

  return db;
};

export interface User {
  id: number;
  username: string;
  password: string;
  is_admin: boolean;
  is_approved: boolean;
}

export default initializeDatabase;
