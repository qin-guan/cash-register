<!-- pages/settings.vue -->
<template>
  <div>
    <h2>User Settings</h2>
    <div class="tabs">
      <button @click="selectedSettingsTab = 'user-settings'" :class="{ active: selectedSettingsTab === 'user-settings' }">User Settings</button>
      <button v-if="isAdmin" @click="selectedSettingsTab = 'admin'" :class="{ active: selectedSettingsTab === 'admin' }">Admin</button>
      <button v-if="isAdmin" @click="selectedSettingsTab = 'manage-categories'" :class="{ active: selectedSettingsTab === 'manage-categories' }">Manage Categories</button>
    </div>

    <div v-if="selectedSettingsTab === 'user-settings'">
      <UserSettings />
    </div>

    <div v-else-if="selectedSettingsTab === 'admin' && isAdmin">
      <AdminPage />
    </div>

    <div v-else-if="selectedSettingsTab === 'manage-categories' && isAdmin">
      <ManageCategoriesPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminPage from './admin.vue';
import ManageCategoriesPage from './manage-categories.vue';
import UserSettings from './user-settings.vue';
const { getItem } = useLocalStorage();

const selectedSettingsTab = ref('user-settings');
const isAdmin = ref(false);

onMounted(async () => {
  await checkLoginStatus();
});

async function checkLoginStatus() {
  const token = getItem('authToken');
  if (!token) {
    router.push('/login');
  } else {
    await checkAdminStatus(token);
  }
}

async function checkAdminStatus(token: string) {
  try {
    const response = await fetch('/api/users/auth/checkAdmin', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      isAdmin.value = data.isAdmin;
    } else {
      console.error('Failed to check admin status');
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
  }
}
</script>

<style scoped>
.tabs {
  display: flex;
  margin-bottom: 20px;
}
.tabs button {
  padding: 10px 20px;
  margin-right: 10px;
  border: none;
  background-color: #f0f0f0;
  cursor: pointer;
}
.tabs button.active {
  background-color: #007bff;
  color: white;
}
</style>
