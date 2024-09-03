<!-- pages/admin.vue -->
<template>
  <UContainer class="admin-container">
    <h1 class="page-title">Admin Dashboard</h1>
    <UCard v-if="loading" class="loading-card">Loading...</UCard>
    <UCard v-else-if="error" class="error-card">{{ error }}</UCard>
    <UCard v-else class="users-table">
      <UTable :rows="rows" :columns="columns">
        <template #actions-data="{ row }">
          <UDropdown :items="actions(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
      </UTable>
    </UCard>
  </UContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const { getItem } = useLocalStorage();

const router = useRouter();
const users = ref([]);
const loading = ref(true);
const error = ref(null);

const rows = ref([]);
const columns = [
  {key: 'id', label: 'ID'},
  {key: 'name', label: 'Name'},
  {key: 'role', label: 'Role'},
  {key: 'status', label: 'Status'},
  {key: 'actions', label: 'Actions'},
]

onMounted(async () => {
  try {
    const token = getItem('authToken');
    const response = await fetch('/api/users/admin/getUsers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('You do not have permission to access this page');
    }
    users.value = await response.json();

    rows.value = users.value.map(user => {
      return {
        id: user.id,
        name: user.username,
        role: user.is_admin ? 'Admin' : 'User',
        status: user.is_approved ? 'Approved' : 'Pending',
      };
    });

    loading.value = false;
  } catch (err) {
    error.value = err.message;
    loading.value = false;
  }
});

function actions(row) {
  return [[
    {
      label: row.status === 'Approved' && row.role === 'User' ? 'Promote' : 'Demote',
      icon: row.role === 'User' ? 'i-heroicons-arrow-up-on-square-20-solid' : 'i-heroicons-arrow-down-on-square-20-solid',
      click: () => row.role === 'Admin' ? demoteUser(row.id) : promoteUser(row.id)
    },
    {
      label: row.status === 'Approved' ? 'Remove' : 'Approve',
      icon: 'i-heroicons-check-circle-20-solid',
      click: () => row.status === 'Approved' ? removeUser(row.id) : approveUser(row.id)
    }
  ]]
}

async function promoteUser(userId) {
  await updateAdmin(userId, { is_admin: true });
}

async function demoteUser(userId) {
  await updateAdmin(userId, { is_admin: false });
}

async function approveUser(userId) {
  try {
    const token = getItem('authToken');
    const response = await fetch(`/api/users/admin/approveUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    const updatedUser = await response.json();
    const index = users.value.findIndex(user => user.id === userId);
    if (index !== -1) {
      users.value[index] = updatedUser;
    }
  } catch (err) {
    error.value = err.message;
  }
}

async function removeUser(userId) {
  if (confirm('Are you sure you want to remove this user?')) {
    try {
      const token = getItem('authToken');
      const response = await fetch(`/api/users/admin/deleteUser`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      if (!response.ok) {
        throw new Error('Failed to remove user');
      }
      users.value = users.value.filter(user => user.id !== userId);
    } catch (err) {
      error.value = err.message;
    }
  }
}

async function updateAdmin(userId, updates) {
  try {
    const token = getItem('authToken');
    const response = await fetch(`/api/users/admin/setAdmin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId, ...updates }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    const updatedUser = await response.json();
    const index = users.value.findIndex(user => user.id === userId);
    if (index !== -1) {
      users.value[index] = updatedUser;
    }
  } catch (err) {
    error.value = err.message;
  }
}
</script>

<style scoped>
.admin-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

UTable {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

UButton {
  margin-right: 5px;
}
</style>
