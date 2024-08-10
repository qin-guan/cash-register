// categories-db.ts
import { existsSync } from 'fs';
import { Database } from 'duckdb-async';

const databasePath = 'data/categories.db';

const db = await Database.create(databasePath);
await db.connect();

await db.run(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL
  );
`);

export default db;