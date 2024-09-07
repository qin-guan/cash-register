<template>
  <div class="filters">
    <USelectMenu v-model="localSelectedPeriod" :options="periodOptions" placeholder="Select time period" />
    <USelectMenu v-model="localSelectedCategory" :options="categoryOptions" placeholder="Select category" />
    <div class="filter-actions">
      <UButton class="filter-reset" @click="$emit('reset-filters')" variant="outline">Reset Filters</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  selectedPeriod: Object,
  selectedCategory: Object,
  categoryOptions: Array,
});

const emit = defineEmits(['update:selectedPeriod', 'update:selectedCategory', 'reset-filters']);

const localSelectedPeriod = computed({
  get: () => props.selectedPeriod,
  set: (value) => emit('update:selectedPeriod', value)
});

const localSelectedCategory = computed({
  get: () => props.selectedCategory,
  set: (value) => emit('update:selectedCategory', value)
});

const periodOptions = [
  { label: 'All Time', value: '' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
];

</script>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.filter-actions {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.filter-reset {
  color: var(--color-danger);
}

:deep(.form-group) {
  flex: 1;
  min-width: 200px;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  :deep(.form-group) {
    width: 100%;
  }

  .filter-actions {
    width: 100%;
    justify-content: space-between;
  }

  .filter-actions button {
    flex: 1;
  }
}
</style>
