<template>
  <div class="expense-list-container">
    <h3 class="page-title">Past Records</h3>

    <ExpenseFilters
      :selectedPeriod="selectedPeriod"
      :selectedCategory="selectedCategory"
      :categoryOptions="categoryOptions"
      @update:selectedPeriod="selectedPeriod = $event"
      @update:selectedCategory="selectedCategory = $event"
      @reset-filters="resetFilters"
    />

    <div class="mobile-tabs">
      <UTabs :items="tabItems" @change="onTabChange" />
    </div>

    <div class="charts-container" v-show="!isMobile || activeTab === 'charts'">
      <UTabs :items="chartTabItems" @change="onChartTabChange" />
      <div v-if="activeChartTab === 'income-expense'">
        <IncomeExpenseChart :chartData="barChartData" />
      </div>
      <div v-else-if="activeChartTab === 'category'">
        <ExpensesByCategoryChart :chartData="pieChartData" />
      </div>
    </div>

    <div v-show="!isMobile || activeTab === 'table'">
      <ExpenseTable
        :entries="paginatedEntries"
        :columns="columns"
        @edit="startEditing"
        @delete="deleteExpense"
      />

      <UPagination
        v-model="currentPage"
        :total="filteredEntries.length"
        :per-page="itemsPerPage"
        @change="handlePageChange"
      />
    </div>

    <EditExpenseModal
      v-model:isOpen="isEditModalOpen"
      :expense="editForm"
      :categories="categories"
      @save="handleSave"
      @cancel="cancelEditing"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useExpenses } from '@/composables/useExpenses';
import { useCategories } from '@/composables/useCategories';
import ExpenseFilters from './components/ExpenseFilters.vue';
import IncomeExpenseChart from './components/IncomeExpenseChart.vue';
import ExpensesByCategoryChart from './components/ExpensesByCategoryChart.vue';
import ExpenseTable from './components/ExpenseTable.vue';
import EditExpenseModal from './components/EditExpenseModal.vue';

const {
  expenses,
  entries,
  fetchExpenses,
  updateExpense,
  deleteExpense
} = useExpenses();

const {
  categoriesByName,
  fetchCategories,
} = useCategories();

// Reactive variables
const isEditModalOpen = ref(false);
const editForm = ref({});
const currentPage = ref(1);
const itemsPerPage = 10;
const selectedPeriod = ref({ label: 'All Time', value: '' });
const selectedCategory = ref({ label: 'All Categories', value: '' });
const activeTab = ref('table');
const isMobile = ref(false);
const activeChartTab = ref('income-expense');

// Constants
const columns = [
  { key: 'date', label: 'Date' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount' },
  { key: 'actions', label: 'Actions' },
];

const tabItems = [
  { label: 'Table', slot: 'table' },
  { label: 'Charts', slot: 'charts' },
];

const chartTabItems = [
  { label: 'Income vs Expenses', slot: 'income-expense' },
  { label: 'Expenses by Category', slot: 'category' },
];

// Computed properties
const categoryOptions = computed(() => [
  { label: 'All Categories', value: '' },
  ...categoriesByName.value
    .map(cat => ({ label: cat, value: cat }))
]);

const filteredEntries = computed(() => {
  let filtered = [...entries.value];

  if (selectedPeriod.value.value) {
    const now = new Date();
    let startDate = new Date(now);

    if (selectedPeriod.value.value === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (selectedPeriod.value.value === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (selectedPeriod.value.value === 'year') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    filtered = filtered.filter(entry => new Date(entry.date) >= startDate);
  }

  if (selectedCategory.value.value) {
    filtered = filtered.filter(entry => entry.category === selectedCategory.value.value);
  }

  return filtered;
});

const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredEntries.value.slice(start, end);
});

const barChartData = computed(() => {
  const income = filteredEntries.value.reduce((sum, entry) => sum + (entry.amount > 0 ? parseFloat(entry.amount) : 0), 0);
  const expenses = filteredEntries.value.reduce((sum, entry) => sum + (entry.amount < 0 ? Math.abs(parseFloat(entry.amount)) : 0), 0);
  return {
    labels: ['Income', 'Expenses'],
    datasets: [{
      label: 'Amount',
      data: [income, expenses],
      backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
    }]
  };
});

const pieChartData = computed(() => {
  const expensesByCategory = filteredEntries.value
    .filter(entry => parseFloat(entry.amount) < 0)
    .reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + Math.abs(parseFloat(entry.amount));
      return acc;
    }, {} as Record<string, number>);

  return {
    labels: Object.keys(expensesByCategory),
    datasets: [{
      data: Object.values(expensesByCategory),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
      ],
    }]
  };
});

// Watchers
watch([selectedPeriod, selectedCategory], applyFilters);

// Lifecycle hooks
onMounted(async () => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  await fetchExpenses();
  await fetchCategories();
});

// Functions
function checkMobile() {
  isMobile.value = window.innerWidth <= 768;
}

function onTabChange(index: number) {
  activeTab.value = tabItems[index].slot;
}

function onChartTabChange(index: number) {
  activeChartTab.value = chartTabItems[index].slot;
}

function applyFilters() {
  currentPage.value = 1; // Goes back to first page if the filters changed
}

function resetFilters() {
  selectedPeriod.value = { label: 'All Time', value: '' };
  selectedCategory.value = { label: 'All Categories', value: '' };
  currentPage.value = 1;
}

function handlePageChange(page: number) {
  currentPage.value = page;
}

function cancelEditing() {
  isEditModalOpen.value = false;
  editForm.value = {};
}

function handleSave(updatedExpense: Expense) {
  updateExpense(updatedExpense);
  isEditModalOpen.value = false;
}

function startEditing(row: any) {
  const expense = expenses.value.find(e => e.id === row.id);
  if (expense) {
    editForm.value = { ...expense };
    isEditModalOpen.value = true;
  }
}
</script>

<style scoped>
.expense-list-container {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.charts-container {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  width: 100%;
}

.chart {
  width: 100%;
  height: 300px;
  margin-top: 20px;
}

:deep(.expense-table) {
  min-width: 100%;
  width: max-content;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
}

:deep(th),
:deep(td) {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-border-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(th) {
  background-color: var(--color-background-subtle);
  font-weight: bold;
}

:deep(tr:hover) {
  background-color: var(--color-background-hover);
  transition: background-color 0.3s ease;
}

/* Define specific widths for each column */
:deep(th:nth-child(1)), :deep(td:nth-child(1)) { width: 100px; }
:deep(th:nth-child(2)), :deep(td:nth-child(2)) { width: 150px; }
:deep(th:nth-child(3)), :deep(td:nth-child(3)) { width: 300px; }
:deep(th:nth-child(4)), :deep(td:nth-child(4)) { width: 100px; }
:deep(th:nth-child(5)), :deep(td:nth-child(5)) { width: 100px; }

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.edit-modal {
  max-width: 90vw;
  width: 100%;
  margin: 0 auto;
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

.mobile-tabs {
  display: none;
}

@media (max-width: 1024px) {
  .expense-list-container { padding: 10px; }
}

@media (max-width: 768px) {
  .mobile-tabs {
    display: block;
    margin-bottom: 20px;
  }

  .charts-container { flex-direction: column; }
  .chart { height: 250px; margin-bottom: 30px; }
  .expense-list-container { padding: 5px; }
  :deep(th), :deep(td) { padding: 6px; }
  :deep(.chartjs-render-monitor) {
    max-width: 100%;
    max-height: 100%;
  }
}

@media (max-width: 640px) {
  .expense-list-container { padding: 2px; }
  .edit-modal { max-width: 98vw; }
  :deep(th), :deep(td) { padding: 4px; }
}

@media (max-width: 480px) {
  .chart { height: 200px; }
}
</style>
