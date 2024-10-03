<template>
  <div class="admin-container">
    <h2 class="page-title">Admin Dashboard</h2>

    <UButton
      class="mb-4"
      label="Create New User"
      @click="isCreateUserModalOpen = true"
    />

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="users-table">
      <div class="table-responsive">
        <UTable :rows="rows" :columns="columns">
          <template #actions-data="{ row }">
            <UDropdown :items="actions(row)">
              <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
            </UDropdown>
          </template>
        </UTable>
      </div>
    </div>

    <UModal v-model="isCreateUserModalOpen">
    <UCard>
      <template #header>
        <h3 class="text-lg font-bold">Create New User</h3>
      </template>
      <form @submit.prevent="createUser">
        <UFormGroup label="Username">
          <UInput v-model="newUsername" type="text" required />
        </UFormGroup>
        <UButton type="submit" color="primary" class="mt-4">Create User</UButton>
      </form>
    </UCard>
  </UModal>
  </div>
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

const isCreateUserModalOpen = ref(false);
const newUsername = ref('');

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

async function createUser() {
  try {
    const token = getItem('authToken');
    const response = await fetch('/api/users/admin/createUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username: newUsername.value }),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    const newUser = await response.json();
    users.value.push(newUser);
    rows.value.push({
      id: newUser.id,
      name: newUser.username,
      role: newUser.is_admin ? 'Admin' : 'User',
      status: newUser.is_approved ? 'Approved' : 'Pending',
    });

    isCreateUserModalOpen.value = false;
    newUsername.value = '';
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
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.loading,
.error,
.users-table {
  margin-bottom: 20px;
}

.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

:deep(.u-table) {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
}

:deep(.u-table th),
:deep(.u-table td) {
  padding: 10px;
  border: 1px solid #ccc;
  white-space: nowrap;
}

:deep(.u-table th) {
  background-color: #f2f2f2;
  font-weight: bold;
}

:deep(.u-dropdown) {
  min-width: auto;
}

@media (max-width: 768px) {
  :deep(.u-table) {
    font-size: 14px;
  }

  :deep(.u-table th),
  :deep(.u-table td) {
    padding: 8px;
  }
}
</style>