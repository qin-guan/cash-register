// /Users/julianteh/julwrites/cash-register/server/api/expenses/index.ts

import { Database } from 'duckdb-async';
import { defineEventHandler, createError } from 'h3';
import { existsSync } from 'fs';

// Define the Expense interface
export interface Expense {
  id?: number;
  amount: number;
  description: string;
  date: string;
  category: string;
}

const databasePath = 'data/expenses.db';

// Initialize DuckDB connection
const db = await Database.create(databasePath);
await db.connect();

// Create table if not exists
await db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY,
    amount DECIMAL(10, 2),
    description VARCHAR(255),
    date DATE,
    category VARCHAR(50)
  );
`);

// Load data from CSV file if it exists
if (!existsSync(databasePath)) {
  console.log("No existing CSV file found. Starting with empty table.");
}

// Utility function to get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export default defineEventHandler(async (event) => {
  const expenses = await db.all("SELECT * FROM expenses") as Expense[];
  console.log(expenses)
  return expenses;
});
