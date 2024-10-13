// /composables/defaultExpense.ts

export const defaultExpense: Expense = {
  id: null,
  credit: 0,
  debit: 0,
  description: '',
  date: new Date().toISOString().split('T')[0],
  category: '',
};