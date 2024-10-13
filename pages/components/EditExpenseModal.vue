<template>
  <UModal v-model="isOpen">
    <UCard class="edit-modal">
      <template #header>
        <h3 class="modal-title">Edit Expense</h3>
      </template>
      <ExpenseForm
        :expense="expense"
        submitButtonText="Update"
        @submit="$emit('save', $event)"
        @cancel="$emit('cancel')"
      />
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ExpenseForm from './ExpenseForm.vue';

const props = defineProps({
  isOpen: Boolean,
  expense: Object,
  categories: Array
});

const emit = defineEmits(['update:isOpen', 'save', 'cancel']);

const isOpen = computed({
  get: () => props.isOpen,
  set: (value) => emit('update:isOpen', value)
});
</script>

<style scoped>
.modal-title {
  font-size: 18px;
  font-weight: semibold;
}

.edit-modal {
  max-width: 90vw;
  width: 100%;
  margin: 0 auto;
}
</style>
