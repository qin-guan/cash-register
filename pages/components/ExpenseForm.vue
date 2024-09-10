<template>
  <div class="expense-form-container">
    <UForm @submit.prevent="handleSubmit" class="expense-form">
      <UFormGroup label="Date" name="date">
        <UInput type="date" id="date" v-model="expenseData.date" required />
      </UFormGroup>
      <UFormGroup label="Category" name="category">
        <USelectMenu v-model="expenseData.category" :options="categories" id="category" required />
      </UFormGroup>
      <UFormGroup label="Description" name="description">
        <UInput type="text" id="description" v-model="expenseData.description" required />
      </UFormGroup>
      <UFormGroup label="Debit" name="debit">
        <UInput type="number" id="debit" v-model.number="expenseData.debit" step="0.01" min="0" />
      </UFormGroup>
      <UFormGroup label="Credit" name="credit">
        <UInput type="number" id="credit" v-model.number="expenseData.credit" step="0.01" min="0" />
      </UFormGroup>
      <div class="form-actions">
        <UButton type="submit" color="primary">{{ props.submitButtonText }}</UButton>
        <UButton type="button" color="gray" @click="cancelEdit">Cancel</UButton>
      </div>
    </UForm>
  </div>
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

const expenseData = ref<Expense>({
  ...props.expense,
  date: props.expense.date || new Date().toISOString().split('T')[0]
});

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
  expenseData.value = { date: '', category: '', description: '', credit: 0, debit: 0 }; // Reset UForm
  emits('cancel');
}
</script>

<style scoped>
.expense-form-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.expense-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

:deep(.form-group) {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

:deep(.form-group label) {
  font-weight: bold;
  color: var(--color-text-primary);
}

:deep(.form-group input),
:deep(.form-group select) {
  padding: 10px;
  border: 1px solid var(--color-border-input);
  border-radius: 4px;
  font-size: 16px;
  background-color: var(--color-background-input);
  color: var(--color-text-primary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

:root {
  --color-background-card: #ffffff;
  --color-border-subtle: #e2e8f0;
  --color-text-primary: #1a202c;
  --color-border-input: #cbd5e0;
  --color-background-input: #ffffff;
}

:root.dark {
  --color-background-card: #2d3748;
  --color-border-subtle: #4a5568;
  --color-text-primary: #f7fafc;
  --color-border-input: #4a5568;
  --color-background-input: #2d3748;
}
</style>