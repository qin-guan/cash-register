import { defineEventHandler, readBody, createError } from 'h3';
import db, { Expense } from './expenses-db';

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const id = event.context.params?.id;

  // GET: Fetch a single expense
  if (method === 'GET') {
    const expense = await db.all("SELECT * FROM expenses WHERE id = ?", id) as Expense[];
    if (expense.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Expense not found',
      });
    }
    return expense[0];
  }

  // PUT: Update an expense
  if (method === 'PUT') {
    const updatedExpense: Expense = await readBody(event);
    await db.run(`
      UPDATE expenses
      SET credit = ?, debit = ?, description = ?, date = ?, category = ?
      WHERE id = ?
    `, updatedExpense.credit || 0, updatedExpense.debit || 0, updatedExpense.description, updatedExpense.date, updatedExpense.category, id);
    
    // Check if the expense exists after the update
    const updatedResult = await db.all("SELECT * FROM expenses WHERE id = ?", id);

    if (updatedResult.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Expense not found',
      });
    }
    
    return { id: Number(id), ...updatedExpense };
  }

  // DELETE: Delete an expense
  if (method === 'DELETE') {
    await db.run("DELETE FROM expenses WHERE id = ?", id);

    // Check if the expense exists after the delete
    const updatedResult = await db.all("SELECT * FROM expenses WHERE id = ?", id);
    
    if (updatedResult.length > 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Expense was not deleted correctly',
      });
    }

    console.log(`Expense with ID ${id} deleted successfully`);
    
    return { message: 'Expense deleted successfully' };
  }
});
