<template>
  <div class="categories-container">
    <h2 class="page-title">Manage Categories</h2>
    
    <div class="categories-table">
      <UTable :rows="categories" :columns="columns">
        <template #actions-data="{ row }">
          <UDropdown :items="actions(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
      </UTable>
    </div>

    <UModal v-model="isEditModalOpen">
      <div class="edit-modal">
        <h3 class="modal-title">Edit Category</h3>
        <UForm :state="editFormState" @submit="updateCategory" class="edit-form">
          <UFormGroup label="Category Name" name="name">
            <UInput v-model="editFormState.name" />
          </UFormGroup>
          <div class="modal-actions">
            <UButton color="gray" @click="isEditModalOpen = false">Cancel</UButton>
            <UButton type="submit" color="primary">Update</UButton>
          </div>
        </UForm>
      </div>
    </UModal>

    <div class="new-category-form">
      <UForm :state="newCategoryState" @submit="addCategory">
        <UFormGroup label="New Category" name="name">
          <UInput v-model="newCategoryState.name" placeholder="Enter new category name" />
        </UFormGroup>
        <UButton type="submit" color="primary" class="add-button">Add Category</UButton>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Category {
  id: number;
  name: string;
}

const categories = ref<Category[]>([]);
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'actions', label: 'Actions' },
];

const isEditModalOpen = ref(false);
const editFormState = ref({ id: null, name: '' });
const newCategoryState = ref({ name: '' });

onMounted(async () => {
  await fetchCategories();
});

function actions(row: Category) {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => startEditCategory(row),
      },
      {
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid',
        click: () => deleteCategory(row.id),
      },
    ],
  ];
}

async function fetchCategories() {
  try {
    const response = await fetch('/api/categories');
    if (response.ok) {
      categories.value = await response.json();
    } else {
      console.error('Failed to fetch categories');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

async function addCategory() {
  try {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newCategoryState.value.name }),
    });

    if (response.ok) {
      const addedCategory = await response.json();
      categories.value.push(addedCategory);
      newCategoryState.value.name = '';
    } else {
      const errorData = await response.json();
      throw new Error(errorData.statusMessage || 'Failed to add category');
    }
  } catch (error) {
    alert('Failed to add category. Please try again.');
  }
}

async function deleteCategory(categoryId: number) {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      categories.value = categories.value.filter(category => category.id !== categoryId);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.statusMessage || 'Failed to delete category');
    }
  } catch (error) {
    alert('Failed to delete category. Please try again.');
  }
}

function startEditCategory(category: Category) {
  editFormState.value = { ...category };
  isEditModalOpen.value = true;
}

async function updateCategory() {
  try {
    const response = await fetch(`/api/categories/${editFormState.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: editFormState.value.name }),
    });

    if (response.ok) {
      const updatedCategory = await response.json();
      const index = categories.value.findIndex(category => category.id === updatedCategory.id);
      if (index !== -1) {
        categories.value[index] = updatedCategory;
      }
      isEditModalOpen.value = false;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.statusMessage || 'Failed to update category');
    }
  } catch (error) {
    alert('Failed to update category. Please try again.');
  }
}
</script>

<style scoped>
.categories-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.categories-table {
  margin-bottom: 20px;
  overflow-x: auto;
}

.modal-title {
  font-size: 18px;
  font-weight: semibold;
  margin-bottom: 15px;
}

.edit-modal {
  padding: 20px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.new-category-form {
  margin-top: 20px;
}

:deep(.form-group) {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
}

:deep(.form-group label) {
  font-weight: bold;
}

:deep(.form-group input) {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.add-button {
  align-self: flex-start;
}
</style>