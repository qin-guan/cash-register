import { ref } from 'vue';

export function useExpenses() {
  const expenses = ref([]);
  const entries = ref([]);
  const categories = ref([]);

  async function fetchExpenses() {
    try {
      const response = await fetch('/api/expenses');
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      expenses.value = await response.json();

      entries.value = expenses.value.map(expense => ({
        id: expense.id,
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: (expense.credit - expense.debit).toFixed(2),
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const json = await response.json();
        categories.value = json.map((category: { id: number, name: string }) => category.name);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function updateExpense(updatedExpense) {
    try {
      const response = await fetch(`/api/expenses/${updatedExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedExpense)
      });
      if (!response.ok) {
        throw new Error('Failed to update expense');
      }

      const refreshedExpense = await response.json();
      const index = expenses.value.findIndex(expense => expense.id === refreshedExpense.id);
      expenses.value.splice(index, 1, refreshedExpense);

      const updatedEntry = {
        id: refreshedExpense.id,
        date: refreshedExpense.date,
        category: refreshedExpense.category,
        description: refreshedExpense.description,
        amount: (refreshedExpense.credit - refreshedExpense.debit).toFixed(2),
      };
      const entryIndex = entries.value.findIndex(e => e.id === refreshedExpense.id);
      entries.value.splice(entryIndex, 1, updatedEntry);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  }

  async function deleteExpense(id) {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }
      expenses.value = expenses.value.filter(expense => expense.id !== id);
      entries.value = entries.value.filter(entry => entry.id !== id);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  }

  return {
    expenses,
    entries,
    categories,
    fetchExpenses,
    fetchCategories,
    updateExpense,
    deleteExpense
  };
}