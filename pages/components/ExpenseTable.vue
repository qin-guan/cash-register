<template>
  <div class="table-container">
    <UTable :rows="entries" :columns="columns" table-class="expense-table">
      <template #actions-data="{ row }">
        <UDropdown :items="actions(row)">
          <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  entries: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete']);

function actions(row: any) {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => emit('edit', row),
      },
      {
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid',
        click: () => emit('delete', row.id),
      },
    ],
  ];
}
</script>

<style scoped>
.table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.expense-list-container {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.charts-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  flex-wrap: wrap;
}

.chart {
  width: 48%;
  height: 300px;
  margin-bottom: 20px;
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
:deep(th:nth-child(1)),
:deep(td:nth-child(1)) {
  width: 100px; /* Date column */
}

:deep(th:nth-child(2)),
:deep(td:nth-child(2)) {
  width: 150px; /* Category column */
}

:deep(th:nth-child(3)),
:deep(td:nth-child(3)) {
  width: 300px; /* Description column */
}

:deep(th:nth-child(4)),
:deep(td:nth-child(4)) {
  width: 100px; /* Amount column */
}

:deep(th:nth-child(5)),
:deep(td:nth-child(5)) {
  width: 100px; /* Actions column */
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.modal-title {
  font-size: 18px;
  font-weight: semibold;
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

@media (max-width: 1024px) {
  .expense-list-container {
    padding: 10px;
  }
}

@media (max-width: 768px) {
  .expense-list-container {
    padding: 5px;
  }

  :deep(th),
  :deep(td) {
    padding: 6px;
  }

  .chart {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .expense-list-container {
    padding: 2px;
  }

  .edit-modal {
    max-width: 98vw;
  }

  :deep(th),
  :deep(td) {
    padding: 4px;
  }
}
</style>