// pages/expenses.vue
<template>
  <div>
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

onMounted(async () => {
  await fetchExpenses()
})

async function fetchExpenses() {
  try {
    console.log('Fetching expenses...') // Agrega este log para verificar si se está ejecutando la función fetchExpenses()
    const response = await fetch('/api/expenses')
    if (!response.ok) {
      throw new Error('Failed to fetch expenses')
    }
    expenses.value = await response.json()
  } catch (error) {
    console.error('Error fetching expenses:', error)
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
