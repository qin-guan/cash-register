<template>
  <div>
    <h2>Expenses</h2>
    <ul>
      <li v-for="expense in expenses" :key="expense.id">
        <span v-if="!editingId || editingId !== expense.id">
          {{ expense.date }} - {{ expense.category }} - {{ expense.description }}: ${{ (expense.credit - expense.debit).toFixed(2) }}
          <button @click="startEditing(expense)">Edit</button>
          <button @click="deleteExpense(expense.id)">Delete</button>
        </span>
        <span v-else>
          <ExpenseForm :expense="editForm" :categories="categories" submitButtonText="Save" @submit="updateExpense" @cancel="cancelEditing" />
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ExpenseForm from './components/ExpenseForm.vue';

const expenses = ref<Expense[]>([]);
const editingId = ref<number | null>(null);
const editForm = ref<Expense>({
  credit: 0,
  debit: 0,
  description: '',
  date: '',
  category: ''
});

const categories = ref<string[]>([]);

onMounted(async () => {
  await fetchExpenses();
});

async function fetchExpenses() {
  try {
    const response = await fetch('/api/expenses');
    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }
    expenses.value = await response.json();
  } catch (error) {
    console.error('Error fetching expenses:', error);
  }
}

function startEditing(expense: Expense) {
  editingId.value = expense.id;
  editForm.value = { ...expense };
}

function cancelEditing() {
  editingId.value = null;
  editForm.value = {
    credit: 0,
    debit: 0,
    description: '',
    date: '',
    category: ''
  };
}

async function updateExpense(updatedExpense: Expense) {
  try {
    const response = await fetch(`/api/expenses/${editingId.value}`, {
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
    const index = expenses.value.findIndex(expense => expense.id === editingId.value);
    expenses.value.splice(index, 1, refreshedExpense);

    cancelEditing();
  } catch (error) {
    console.error('Error updating expense:', error);
  }
}

async function deleteExpense(id: number) {
  try {
    const response = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete expense');
    }
    expenses.value = expenses.value.filter(expense => expense.id !== id);
  } catch (error) {
    console.error('Error deleting expense:', error);
  }
}
</script>
