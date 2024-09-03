<template>
  <UContainer class="expense-list-container">
    <h2 class="page-title">Expenses</h2>
    <UCard class="expense-table">
      <UTable :rows="paginatedEntries" :columns="columns">
        <template #actions-data="{ row }">
          <UDropdown :items="actions(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
      </UTable>
      <div class="pagination">
        <UPagination
          v-model="currentPage"
          :total="entries.length"
          :per-page="itemsPerPage"
          @change="handlePageChange"
        />
      </div>
    </UCard>

    <UModal v-model="isEditModalOpen">
      <UCard>
        <template #header>
          <h3 class="modal-title">Edit Expense</h3>
        </template>
        <ExpenseForm
          :expense="editForm"
          :categories="categories"
          submitButtonText="Update"
          @submit="handleSave"
          @cancel="cancelEditing"
        />
      </UCard>
    </UModal>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import ExpenseForm from './components/ExpenseForm.vue';

interface Expense {
  id: number;
  credit: number;
  debit: number;
  description: string;
  date: string;
  category: string;
}

const expenses = ref<Expense[]>([]);
const isEditModalOpen = ref(false);
const editForm = ref<Expense>({
  id: 0,
  credit: 0,
  debit: 0,
  description: '',
  date: '',
  category: ''
});
const entries = ref([]);

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount' },
  { key: 'actions', label: 'Actions' },
];

const currentPage = ref(1);
const itemsPerPage = 10;
const categories = ref<string[]>([]);

onMounted(async () => {
  await fetchExpenses();
  await fetchCategories();
});

const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return entries.value.slice(start, end);
});

function handlePageChange(page: number) {
  currentPage.value = page;
}

function actions(row: any) {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => startEditing(row),
      },
      {
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid',
        click: () => deleteExpense(row.id),
      },
    ],
  ];
}

function handleSave(updatedExpense: Expense) {
  console.log("handleSave was called")
  updateExpense(updatedExpense);
}

async function fetchExpenses() {
  try {
    const response = await fetch('/api/expenses');
    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }
    expenses.value = await response.json();

    entries.value = expenses.value.map(expense => ({
      id: expense.id,
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: (expense.credit - expense.debit).toFixed(2),
    }));
  } catch (error) {
    console.error('Error fetching expenses:', error);
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

function startEditing(row: any) {
  const expense = expenses.value.find(e => e.id === row.id);
  if (expense) {
    editForm.value = { ...expense };
    isEditModalOpen.value = true;
  }
}

function cancelEditing() {
  isEditModalOpen.value = false;
  editForm.value = {
    id: 0,
    credit: 0,
    debit: 0,
    description: '',
    date: '',
    category: ''
  };
}

async function updateExpense(updatedExpense: Expense) {
  try {
    const response = await fetch(`/api/expenses/${updatedExpense.id}`, {
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
    const index = expenses.value.findIndex(expense => expense.id === refreshedExpense.id);
    expenses.value.splice(index, 1, refreshedExpense);

    // Update entries
    const updatedEntry = {
      id: refreshedExpense.id,
      date: refreshedExpense.date,
      category: refreshedExpense.category,
      description: refreshedExpense.description,
      amount: (refreshedExpense.credit - refreshedExpense.debit).toFixed(2),
    };
    const entryIndex = entries.value.findIndex(e => e.id === refreshedExpense.id);
    entries.value.splice(entryIndex, 1, updatedEntry);

    isEditModalOpen.value = false;
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

<style scoped>
.expense-list-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.expense-table {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.modal-title {
  font-size: 18px;
  font-weight: semibold;
}

:deep(table) {
  width: 100%;
  border-collapse: collapse;
}

:deep(th),
:deep(td) {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-border-subtle);
}

:deep(th) {
  background-color: var(--color-background-subtle);
  font-weight: bold;
}

:deep(tr:hover) {
  background-color: var(--color-background-hover);
  transition: background-color 0.3s ease;
}

:root {
  --color-border-subtle: #e2e8f0;
  --color-background-subtle: #f8fafc;
  --color-background-hover: #f1f5f9;
}

:root.dark {
  --color-border-subtle: #2d3748;
  --color-background-subtle: #1a202c;
  --color-background-hover: #2d3748;
}
</style>

