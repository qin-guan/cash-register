<template>
  <div>
    <h1>Expense Tracker</h1>
    
    <!-- Expense Input Form -->
    <form @submit.prevent="addExpense">
      <div>
        <label for="date">Date:</label>
        <input type="date" id="date" v-model="newExpense.date" required>
      </div>
      <div>
        <label for="category">Category:</label>
        <input type="text" id="category" v-model="newExpense.category" required>
      </div>
      <div>
        <label for="description">Description:</label>
        <input type="text" id="description" v-model="newExpense.description" required>
      </div>
      <div>
        <label for="amount">Amount:</label>
        <input type="number" id="amount" v-model="newExpense.amount" step="0.01" required>
      </div>
      <button type="submit">Add Expense</button>
    </form>

    <!-- Expense List -->
    <h2>Expenses</h2>
    <ul>
      <li v-for="expense in expenses" :key="expense.id">
        {{ expense.date }} - {{ expense.category }} - {{ expense.description }}: ${{ expense.amount.toFixed(2) }}
        <button @click="deleteExpense(expense.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const expenses = ref<Expense[]>([])
const newExpense = ref<Expense>({
  amount: 0,
  description: '',
  date: '',
  category: ''
})

onMounted(async () => {
  await fetchExpenses()
})

async function fetchExpenses() {
  try {
    const response = await fetch('/api/expenses')
    if (!response.ok) {
      throw new Error('Failed to fetch expenses')
    }
    expenses.value = await response.json()
  } catch (error) {
    console.error('Error fetching expenses:', error)
  }
}

async function addExpense() {
  try {
    // Ensure all fields are filled and convert amount to number
    if (!newExpense.value.amount || !newExpense.value.description || !newExpense.value.date || !newExpense.value.category) {
      alert('Please fill all fields');
      return;
    }

    const expenseToSend = {
      ...newExpense.value,
      amount: Number(newExpense.value.amount)
    };

    console.log('Sending expense:', expenseToSend);

    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseToSend),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.statusMessage || 'Failed to add expense');
    }

    const addedExpense = await response.json();
    expenses.value.push(addedExpense);
    newExpense.value = {
      amount: 0,
      description: '',
      date: '',
      category: ''
    };
  } catch (error) {
    console.error('Error adding expense:', error);
    alert('Failed to add expense. Please try again.');
  }
}


async function deleteExpense(id: number | undefined) {
  if (id === undefined) return
  try {
    const response = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete expense')
    }
    expenses.value = expenses.value.filter(expense => expense.id !== id)
  } catch (error) {
    console.error('Error deleting expense:', error)
  }
}
</script>

<style scoped>
/* Add your styles here */
</style>
