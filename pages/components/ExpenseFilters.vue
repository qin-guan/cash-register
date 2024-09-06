<template>
  <div class="filters">
    <UFormGroup>
      <USelectMenu v-model="localSelectedPeriod" :options="periodOptions" placeholder="Select time period" />
      <USelectMenu v-model="localSelectedCategory" :options="categoryOptions" placeholder="Select category" />
    </UFormGroup>
    <div class="filter-actions">
      <UButton @click="$emit('apply-filters')">Apply Filters</UButton>
      <UButton @click="$emit('reset-filters')" variant="outline">Reset Filters</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

const props = defineProps({
  selectedPeriod: String,
  selectedCategory: String,
});

const emit = defineEmits(['update:selectedPeriod', 'update:selectedCategory', 'apply-filters', 'reset-filters']);

const localSelectedPeriod = computed({
  get: () => props.selectedPeriod,
  set: (value) => emit('update:selectedPeriod', value)
});

const localSelectedCategory = computed({
  get: () => props.selectedCategory,
  set: (value) => emit('update:selectedCategory', value)
});

const periodOptions = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
];

const categoryOptions = ref<string[]>([]);

onMounted(async () => {
  await fetchCategories();
});

async function fetchCategories() {
  try {
    const response = await fetch('/api/categories');
    if (response.ok) {
      const json = await response.json();
      categoryOptions.value = json.map((category: { id: number, name: string }) => ({
        label: category.name,
        value: category.name
      }));
    } else {
      console.error('Failed to fetch categories');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}
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
