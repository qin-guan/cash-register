<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label for="date">Date:</label>
      <input type="date" id="date" v-model="expenseData.date" required>
    </div>
    <div class="form-group">
      <label for="category">Category:</label>
      <select v-model="expenseData.category" id="category" required>
        <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
      </select>
    </div>
    <div>
      <label for="description">Description:</label>
      <input type="text" id="description" v-model="expenseData.description" required>
    </div>
    <div>
      <label for="debit">Debit:</label>
      <input type="number" id="debit" v-model.number="expenseData.debit" step="0.01" min="0">
    </div>
    <div>
      <label for="credit">Credit:</label>
      <input type="number" id="credit" v-model.number="expenseData.credit" step="0.01" min="0">
    </div>
    <button type="submit">{{ submitButtonText }}</button>
    <button type="button" @click="cancelEdit">Cancel</button>
  </form>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, onMounted } from 'vue';

const props = defineProps<{
  expense: Expense;
  categories: string[];
  submitButtonText: string;
}>();

const emits = defineEmits<{
  (event: 'submit', expense: Expense): void;
  (event: 'cancel'): void;
}>();

const expenseData = ref<Expense>({ ...props.expense });

const categories = ref<string[]>(props.categories);

onMounted(async () => {
  await fetchCategories();
});

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

function handleSubmit() {
  if (validateExpense(expenseData.value)) {
    emits('submit', expenseData.value);
  }
  expenseData.value = { date: '', category: '', description: '', credit: 0, debit: 0 }; // Reset form
}

function validateExpense(expense: Expense): boolean {
  if (!expense.date || !expense.category || !expense.description) {
    alert('Please fill in all fields');
    return false;
  }

  if (expense.credit === 0 && expense.debit === 0) {
    alert('You must enter a credit or debit amount');
    return false;
  }

  return true;
}

function cancelEdit() {
  emits('cancel');
}
</script>
