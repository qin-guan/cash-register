import { computed, ref } from 'vue';

export function useCategories() {
  const categories = ref<{ id: number; name: string }[]>([]);
  const categoriesByID = computed(() => 
    categories.value.slice().sort((a, b) => a.id > b.id)
  );
  const categoriesByName = computed(() => 
    categories.value.slice().sort((a, b) => a.name > b.name)
  );

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

  async function addCategory(newCategory: { name: string }) {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        const addedCategory = await response.json();
        categories.value.push(addedCategory);
        return addedCategory;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.statusMessage || 'Failed to add category');
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      throw error;
    }
  }

  async function deleteCategory(categoryId: number) {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        categories.value = categorie.value.filter((category: Category) => category.id !== categoryId);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.statusMessage || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  }

  async function updateCategory(category: Category) {
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: category.name }),
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        const index = categories.value.findIndex((category: Category) => category.id === updatedCategory.id);
        if (index !== -1) {
          categories.value[index] = updatedCategory;
        }
        return updatedCategory;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.statusMessage || 'Failed to update category');
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  }
  
  return {
    categoriesByID,
    categoriesByName,
    fetchCategories,
    addCategory,
    deleteCategory,
    updateCategory
  };
}
