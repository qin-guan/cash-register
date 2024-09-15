// /Users/julianteh/julwrites/cash-register/server/api/expenses/index.ts

import { defineEventHandler, createError } from 'h3';
import db, { Expense } from './expenses-db';

// Utility function to get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export default defineEventHandler(async (event) => {
  return await fetchExpenses();
});

// Add a function to fetch expenses with formatted date
export async function fetchExpenses(): Promise<Expense[]> {
  const result = await db.all(`
    SELECT id, credit, debit, description,
      strftime('%Y-%m-%d', date) as date,
      category
    FROM expenses;
  `);
  return result as Expense[];
}
