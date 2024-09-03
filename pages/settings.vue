<!-- pages/settings.vue -->
<template>
  <div class="settings-container">
    <div class="settings-banner">
      <h2>User Settings</h2>
    </div>
    
    <UContainer class="settings-content">
      <UTabs :items="items" @change="onChange" class="settings-tabs"/>

      <UContainer v-if="selectedSettingsTab === 'user-settings'">
        <UserSettings />
      </UContainer>

      <UContainer v-else-if="selectedSettingsTab === 'admin' && isAdmin">
        <AdminPage />
      </UContainer>

      <UContainer v-else-if="selectedSettingsTab === 'manage-categories'">
        <ManageCategoriesPage />
      </UContainer>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminPage from './admin.vue';
import ManageCategoriesPage from './manage-categories.vue';
import UserSettings from './user-settings.vue';
const { getItem } = useLocalStorage();

const selectedSettingsTab = ref('user-settings');
const isAdmin = ref(true);

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
.settings-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.settings-banner {
  background-color: #0056b3; /* A slightly darker shade than the main banner */
  color: white;
  padding: 8px 20px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
}

.settings-banner h2 {
  margin: 0;
  font-size: 20px;
}

.settings-content {
  margin-top: 60px; /* Adjust based on your banner height */
  padding: 20px;
}

.settings-tabs {
  margin-bottom: 20px;
}

.settings-tabs :deep(.u-tab) {
  padding: 8px 15px;
  margin-right: 10px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.settings-tabs :deep(.u-tab.active) {
  border-bottom: 2px solid #0056b3;
}
</style>