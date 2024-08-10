<!-- components/user-settings.vue -->
<template>
  <div>
    <form @submit.prevent="updateSettings">
      <div>
        <label for="username">New Username:</label>
        <input type="text" id="username" v-model="newUsername" required>
      </div>
      <div>
        <label for="password">New Password:</label>
        <input type="password" id="password" v-model="newPassword" required>
      </div>
      <button type="submit">Update Settings</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const newUsername = ref('');
const newPassword = ref('');
const message = ref('');
const { getItem } = useLocalStorage();

function updateSettings() {
  const token = getItem('authToken');

  fetch('/api/users/auth/updateSettings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      newUsername: newUsername.value,
      newPassword: newPassword.value
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      message.value = 'Settings updated successfully';
      newUsername.value = '';
      newPassword.value = '';
    } else {
      message.value = data.message || 'Failed to update settings';
    }
  })
  .catch(error => {
    console.error('Error updating settings:', error);
    message.value = 'An error occurred while updating settings';
  });
}
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 300px;
}
input {
  padding: 5px;
}
button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
</style>
