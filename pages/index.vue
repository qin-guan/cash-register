<!-- pages/index.vue -->
<template>
  <UContainer v-if="isLoggedIn">
    <h1>Expense Tracker</h1>

    <UContainer class="header">
      <UTabs :items="items" @change="onChange"/>
    </UContainer>

    <UContainer v-if="selectedTab === 'form'">
      <ExpenseForm />
    </UContainer>
    <UContainer v-else-if="selectedTab === 'list'">
      <ExpenseList />
    </UContainer>
    <UContainer v-else-if="selectedTab === 'settings'">
      <SettingsPage :isAdmin="isAdmin" />
    </UContainer>

    <br />

    <UButton @click="logout" class="logout-btn">Logout</UButton>
  </UContainer>
  <UContainer v-else>
    <p>You need to log in to access the expense tracker.</p>
    <router-link to="/login">Login</router-link>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ExpenseForm from './expense-form.vue';
import ExpenseList from './expense-list.vue';
import SettingsPage from './settings.vue';

const router = useRouter();
const selectedTab = ref('form');
const isLoggedIn = ref(false);
const isAdmin = ref(false);
const { getItem, removeItem } = useLocalStorage();

const items = [
  {
    label: 'Add Record',
    slot: 'form',
  },
  {
    label: 'Expense List',
    slot: 'list',
  },
  {
    label: 'Settings',
    slot: 'settings',
  },
];

onMounted(async () => {
  await checkLoginStatus();
});

function onChange(index) {
  selectedTab.value = items[index].slot;
}

async function checkLoginStatus() {
  const token = getItem('authToken');
  if (!token) {
    router.push('/login');
  } else {
    isLoggedIn.value = true;
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

function logout() {
  removeItem('authToken');
  isLoggedIn.value = false;
  isAdmin.value = false;
  router.push('/login');
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
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

.logout-btn {
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #c82333;
}
</style>
