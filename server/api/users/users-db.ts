// users-db.ts
import { existsSync } from 'fs';
import { Database } from 'duckdb-async';

const databasePath = 'data/users.db';
export const secretKey = process.env.AUTH_SECRET;

const db = await Database.create(databasePath);
await db.connect();

if (!existsSync(databasePath)) {
  console.log("No existing Users Table found. Starting with empty table.");
}

// Create table if not exists and add `is_approved` column
await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(50),
    is_admin BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE
  );
`);

export interface User {
  id: number;
  username: string;
  password: string;
  is_admin: boolean;
  is_approved: boolean;
}

export default db;
