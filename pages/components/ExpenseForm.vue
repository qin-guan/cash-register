<template>
  <UForm @submit.prevent="handleSubmit">
    <UConainer>
      <label for="date">Date:</label>
      <UInput type="date" id="date" v-model="expenseData.date" required />
    </UConainer>
    <UConainer class="form-group">
      <label for="category">Category:</label>
      <USelect v-model="expenseData.category" id="category" required>
        <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
      </USelect>
    </UConainer>
    <UConainer>
      <label for="description">Description:</label>
      <UInput type="text" id="description" v-model="expenseData.description" required />
    </UConainer>
    <UConainer>
      <label for="debit">Debit:</label>
      <UInput type="number" id="debit" v-model.number="expenseData.debit" step="0.01" min="0" />
    </UConainer>
    <UConainer>
      <label for="credit">Credit:</label>
      <UInput type="number" id="credit" v-model.number="expenseData.credit" step="0.01" min="0" />
    </UConainer>
    <UButton type="submit">Submit</UButton>
    <UButton type="UButton" color="red" @click="cancelEdit">Cancel</UButton>
  </UForm>
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
  expenseData.value = { date: '', category: '', description: '', credit: 0, debit: 0 }; // Reset UForm
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
