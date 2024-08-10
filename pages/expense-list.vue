<template>
  <div>
    <h2>Expenses</h2>
    <ul>
      <li v-for="expense in expenses" :key="expense.id">
        <span v-if="!editingId || editingId !== expense.id">
          {{ expense.date }} - {{ expense.category }} - {{ expense.description }}: ${{ expense.amount.toFixed(2) }}
          <button @click="startEditing(expense)">Edit</button>
          <button @click="deleteExpense(expense.id)">Delete</button>
        </span>
        <span v-else>
          <input v-model="editForm.date" placeholder="Date" />
          <input v-model="editForm.category" placeholder="Category" />
          <input v-model="editForm.description" placeholder="Description" />
          <input v-model="editForm.amount" type="number" placeholder="Amount" />
          <button @click="updateExpense(expense.id)">Save</button>
          <button @click="cancelEditing">Cancel</button>
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Expense {
  id: number
  date: string
  category: string
  description: string
  amount: number
}

const expenses = ref<Expense[]>([])
const editingId = ref<number | null>(null)
const editForm = ref<Partial<Expense>>({})

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

function startEditing(expense: Expense) {
  editingId.value = expense.id
  editForm.value = { ...expense }
}

function cancelEditing() {
  editingId.value = null
  editForm.value = {}
}

async function updateExpense(id: number) {
  try {
    const response = await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editForm.value)
    })
    if (!response.ok) {
      throw new Error('Failed to update expense')
    }

    const updatedExpense = await response.json()
    const index = expenses.value.findIndex(expense => expense.id === id)
    expenses.value.splice(index, 1, updatedExpense)

    cancelEditing()
  } catch (error) {
    console.error('Error updating expense:', error)
  }
}

async function deleteExpense(id: number) {
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
