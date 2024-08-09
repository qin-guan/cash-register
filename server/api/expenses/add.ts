// /Users/julianteh/julwrites/cash-register/server/api/expenses/add.ts

import { defineEventHandler, readBody, createError } from 'h3';
import { Database } from 'duckdb-async';
import { Expense } from './index'

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


export default defineEventHandler(async (event) => {
  const expense: Expense = await readBody(event);
  
  console.log('Received expense:', expense);

  // Ensure all required fields are present
  if (!expense.amount || !expense.description || !expense.date || !expense.category) {
    return createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    });
  }

  try {
    // Get the next ID by finding the maximum ID and adding 1
    const maxIdResult = await db.all("SELECT COALESCE(MAX(id), 0) as max_id FROM expenses");
    const nextId = maxIdResult[0].max_id + 1;
    
    const result = await db.run(`
      INSERT INTO expenses (id, amount, description, date, category)
      VALUES (?, ?, ?, ?, ?)
    `, nextId, expense.amount, expense.description, expense.date, expense.category);
    
    return { id: nextId, ...expense };
  } catch (err: unknown) {
    console.error('Error inserting expense:', err);
    return createError({
      statusCode: 500,
      statusMessage: 'Error inserting expense: ' + getErrorMessage(err),
    });
  }
});

// Utility function to get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
