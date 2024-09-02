<template>
  <UContainer>
    <h1>Manage Categories</h1>
    <ul>
      <li v-for="category in categories" :key="category.id">
        <UContainer v-if="editCategoryId === category.id">
          <UInput v-model="editCategoryName" />
          <UButton @click="updateCategory(category.id)">Update</UButton>
          <UButton @click="cancelEdit">Cancel</UButton>
        </UContainer>
        <UContainer v-else>
          {{ category.name }}
          <UButton @click="startEditCategory(category.id, category.name)">Edit</UButton>
          <UButton @click="deleteCategory(category.id)">Delete</UButton>
        </UContainer>
      </li>
    </ul>
    <form @submit.prevent="addCategory">
      <UInput v-model="newCategory" placeholder="New Category" required />
      <UButton type="submit">Add Category</UButton>
    </form>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Category {
  id: number;
  name: string;
}

const categories = ref<Category[]>([]);
const newCategory = ref('');
const editCategoryId = ref<number | null>(null);
const editCategoryName = ref('');

onMounted(async () => {
  await fetchCategories();
});

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
    const response = await fetch('/api/categories', 
    { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json', 
      }, 
      body: JSON.stringify({ name: newCategory.value }), 
    });

    if (response.ok) {
      const addedCategory = await response.json();
      categories.value.push(addedCategory);
      newCategory.value = '';
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
    const response = await fetch(`/api/categories/${categoryId}`, 
      {
        method: 'DELETE', 
      }
    );

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

function startEditCategory(id: number, name: string) {
  editCategoryId.value = id;
  editCategoryName.value = name;
}

function cancelEdit() {
  editCategoryId.value = null;
  editCategoryName.value = '';
}

async function updateCategory(categoryId: number) {
  try {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: editCategoryName.value }),
    });

    if (response.ok) {
      const updatedCategory = await response.json();
      const index = categories.value.findIndex(category => category.id === categoryId);
      if (index !== -1) {
        categories.value[index] = updatedCategory;
      }
      cancelEdit();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.statusMessage || 'Failed to update category');
    }
  } catch (error) {
    alert('Failed to update category. Please try again.');
  }
}
</script>
