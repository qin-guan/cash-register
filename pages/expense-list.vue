<template>
  <div>
    <h2>Expenses</h2>
    <UTable :rows="entries">
      <template #actions-data="{ row }">
        <UButton size="sm" color="primary" variant="link" @click="startEditing(row)">Edit</UButton>
        <UButton size="sm" color="red" variant="link" @click="deleteExpense(row.id)">Delete</UButton>
      </template>
    </UTable>

    <ExpenseForm
      v-if="editingId !== null"
      :expense="editForm"
      @save="updateExpense"
      @cancel="cancelEditing"
    />
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
const entries = ref([]);

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

    entries.value = expenses.value.map(expense => {
      return {
        id: expense.id,
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: (expense.credit - expense.debit).toFixed(2),
        actions: [
          {
            label: 'Edit',
            onClick: () => startEditing(expense)
          },
          {
            label: 'Delete',
            onClick: () => deleteExpense(expense.id)
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
  }
}

function startEditing(row: any) {
  editingId.value = row.id;
  const expense = expenses.value.find(e => e.id === row.id);
  if (expense) {
    editForm.value = { ...expense };
  }
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

    // Update entries
    const updatedEntry = {
      id: refreshedExpense.id,
      date: refreshedExpense.date,
      category: refreshedExpense.category,
      description: refreshedExpense.description,
      amount: (refreshedExpense.credit - refreshedExpense.debit).toFixed(2),
      actions: entries.value.find(e => e.id === refreshedExpense.id)?.actions
    };
    const entryIndex = entries.value.findIndex(e => e.id === refreshedExpense.id);
    entries.value.splice(entryIndex, 1, updatedEntry);

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
    entries.value = entries.value.filter(entry => entry.id !== id);
  } catch (error) {
    console.error('Error deleting expense:', error);
  }
}

</script>
