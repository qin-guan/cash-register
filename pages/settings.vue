<!-- pages/settings.vue -->
<template>
  <UContainer>
    <h2>User Settings</h2>
    <UTabs :items="items" @change="onChange"/>

    <UContainer v-if="selectedSettingsTab === 'user-settings'">
      <UserSettings />
    </UContainer>

    <UContainer v-else-if="selectedSettingsTab === 'admin' && isAdmin">
      <AdminPage />
    </UContainer>

    <UContainer v-else-if="selectedSettingsTab === 'manage-categories' && isAdmin">
      <ManageCategoriesPage />
    </UContainer>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminPage from './admin.vue';
import ManageCategoriesPage from './manage-categories.vue';
import UserSettings from './user-settings.vue';
const { getItem } = useLocalStorage();

const selectedSettingsTab = ref('user-settings');
const isAdmin = ref(false);

const items = [
  {
    label: 'User Settings',
    slot: 'user-settings',
  },
  {
    label: 'Admin',
    slot: 'admin',
    disabled: !isAdmin.value,
  },
  {
    label: 'Manage Categories',
    slot: 'manage-categories',
    disabled: !isAdmin.value,
  },
];

onMounted(async () => {
  await checkLoginStatus();
});

function onChange(index: number) {
  selectedSettingsTab.value = items[index].slot;
}

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
.tabs UButton {
  padding: 10px 20px;
  margin-right: 10px;
  border: none;
  background-color: #f0f0f0;
  cursor: pointer;
}
.tabs UButton.active {
  background-color: #007bff;
  color: white;
}
</style>
