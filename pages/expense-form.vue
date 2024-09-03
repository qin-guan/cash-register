<template>
  <div class="expense-form-container">
    <h3 class="page-title">Add New Record</h3>
    <ExpenseForm 
      :expense="newExpense" 
      :categories="categories" 
      submitButtonText="Submit" 
      @submit="addExpense" 
    />
  </div>
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

onMounted(async () => {
  await fetchCategories();
});

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

    // Show success message
    alert('Expense added successfully!');

  } catch (error) {
    alert('Failed to add expense. Please try again.');
  }
}

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
</script>

<style scoped>
.expense-form-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

:deep(.form-group) {
  margin-bottom: 20px;
}

:deep(label) {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

:deep(input),
:deep(select),
:deep(textarea) {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--color-border-subtle);
  border-radius: 4px;
}

:deep(button[type="submit"]) {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

:deep(button[type="submit"]:hover) {
  background-color: #0056b3;
}

:root {
  --color-border-subtle: #e2e8f0;
}

:root.dark {
  --color-border-subtle: #2d3748;
}

@media (max-width: 1024px) {
  .expense-form-container {
    padding: 10px;
  }
}

@media (max-width: 768px) {
  .expense-form-container {
    padding: 5px;
  }
}

@media (max-width: 640px) {
  .expense-form-container {
    padding: 2px;
  }
}
</style>
