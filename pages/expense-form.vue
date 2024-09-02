<template>
  <UContainer>
    <h1>Expense Tracker</h1>
    <ExpenseForm :expense="newExpense" :categories="categories" submitButtonText="Add Expense" @submit="addExpense" />
  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ExpenseForm from './components/ExpenseForm.vue';

const newExpense = ref<Expense>({
  credit: 0,
  debit: 0,
  description: '',
  date: '',
  category: '',
});

const categories = ref<string[]>([]);

async function addExpense(expense: Expense) {
  try {
    const response = await fetch('/api/expenses/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.statusMessage || 'Failed to add expense');
    }

    // Clear the form after successful submission
    newExpense.value = {
      credit: 0,
      debit: 0,
      description: '',
      date: '',
      category: ''
    };

  } catch (error) {
    alert('Failed to add expense. Please try again.');
  }
}
</script>
