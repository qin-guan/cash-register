<template>
  <div>
    <h1>Manage Categories</h1>
    <ul>
      <li v-for="category in categories" :key="category.id">
        <div v-if="editCategoryId === category.id">
          <input v-model="editCategoryName" />
          <button @click="updateCategory(category.id)">Update</button>
          <button @click="cancelEdit">Cancel</button>
        </div>
        <div v-else>
          {{ category.name }}
          <button @click="startEditCategory(category.id, category.name)">Edit</button>
          <button @click="deleteCategory(category.id)">Delete</button>
        </div>
      </li>
    </ul>
    <form @submit.prevent="addCategory">
      <input v-model="newCategory" placeholder="New Category" required />
      <button type="submit">Add Category</button>
    </form>
  </div>
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
