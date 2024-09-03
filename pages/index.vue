<!-- pages/index.vue -->
<template>
  <div class="app-container">
    <UContainer v-if="isLoggedIn" class="main-container">
      <div class="banner">
        <h1>Expense Tracker</h1>
        <UTabs :items="items" @change="onChange" class="banner-tabs"/>
      </div>

      <div class="content">
        <UContainer v-if="selectedTab === 'form'">
          <ExpenseForm />
        </UContainer>
        <UContainer v-else-if="selectedTab === 'list'">
          <ExpenseList />
        </UContainer>
        <UContainer v-else-if="selectedTab === 'settings'">
          <SettingsPage :isAdmin="isAdmin" />
        </UContainer>
      </div>

      <footer class="footer">
        <UButton @click="logout" class="logout-btn">Logout</UButton>
      </footer>
    </UContainer>
    <UContainer v-else>
      <p>You need to log in to access the expense tracker.</p>
      <router-link to="/login">Login</router-link>
    </UContainer>
  </div>
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
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 80px; /* Adjust this value based on your banner height */
  padding-bottom: 60px; /* Adjust this value based on your footer height */
}

.banner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
}

.banner h1 {
  margin: 0;
  font-size: 24px;
}

.banner-tabs {
  display: flex;
}

.banner-tabs :deep(.u-tab) {
  color: white;
  padding: 10px 15px;
  margin-right: 10px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.banner-tabs :deep(.u-tab.active) {
  border-bottom: 2px solid white;
}

.content {
  flex: 1;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #f8f9fa;
  padding: 10px 20px;
  text-align: right;
  box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
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