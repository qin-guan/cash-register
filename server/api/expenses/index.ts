// /Users/julianteh/julwrites/cash-register/server/api/expenses/index.ts

import { defineEventHandler, createError } from 'h3';
import db, { Expense } from './expenses-db'


// Utility function to get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export default defineEventHandler(async (event) => {
  const expenses = await db.all("SELECT * FROM expenses") as Expense[];
  return expenses;
});
