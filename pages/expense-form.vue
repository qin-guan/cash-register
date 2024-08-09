// pages/expense-form.vue
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const newExpense = ref<Expense>({
  amount: 0,
  description: '',
  date: '',
  category: ''
})

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

    const response = await fetch('/api/expenses/add', {
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
  } catch (error) {
    console.error('Error adding expense:', error);
    alert('Failed to add expense. Please try again.');
  }
}

</script>

