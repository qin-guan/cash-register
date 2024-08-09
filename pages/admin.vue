<!-- pages/admin.vue -->
<template>
  <div class="admin-page">
    <h1>Admin Dashboard</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Admin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.is_admin ? 'Yes' : 'No' }}</td>
            <td>
              <button v-if="!user.is_admin" @click="promoteUser(user.id)">Promote to Admin</button>
              <button v-else @click="demoteUser(user.id)">Demote from Admin</button>
              <button @click="removeUser(user.id)">Remove User</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const { getItem } = useLocalStorage();

const router = useRouter()
const users = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const token = getItem('authToken');
    const response = await fetch('/api/admin/getUsers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) {
      throw new Error('You do not have permission to access this page')
    }
    users.value = await response.json()
    loading.value = false
  } catch (err) {
    error.value = err.message
    loading.value = false
  }
})

async function promoteUser(userId) {
  await updateUser( userId, true )
}

async function demoteUser(userId) {
  await updateUser( userId, false )
}

async function removeUser(userId) {
  if (confirm('Are you sure you want to remove this user?')) {
    try {
      const token = getItem('authToken');
      const response = await fetch(`/api/admin/deleteUser`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: userId })
      })
      if (!response.ok) {
        throw new Error('Failed to remove user')
      }
      users.value = users.value.filter(user => user.id !== userId)
    } catch (err) {
      error.value = err.message
    }
  }
}

async function updateUser(userId, is_admin) {
  try {
    const token = getItem('authToken');
    const response = await fetch(`/api/admin/updateUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId: userId, is_admin: is_admin }),
    })

    console.log(response);

    if (!response.ok) {
      throw new Error('Failed to update user')
    }
    const updatedUser = await response.json()
    const index = users.value.findIndex(user => user.id === userId)
    if (index !== -1) {
      users.value[index] = updatedUser
    }
  } catch (err) {
    error.value = err.message
  }
}
</script>

<style scoped>
.admin-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

table {
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

button {
  margin-right: 5px;
}
</style>
