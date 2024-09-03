<template>
  <UContainer class="settings-container">
    <h2>User Settings</h2>
    <UForm @submit.prevent="updateSettings" class="settings-form">
      <UFormGroup label="New Username" name="username">
        <UInput type="text" id="username" v-model="newUsername" required />
      </UFormGroup>
      <UFormGroup label="New Password" name="password">
        <UInput type="password" id="password" v-model="newPassword" required />
      </UFormGroup>
      <UButton type="submit" color="primary" class="update-button">Update Settings</UButton>
    </UForm>
    <p v-if="message" class="message">{{ message }}</p>
  </UContainer>
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
.settings-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

:deep(.form-group) {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

:deep(.form-group label) {
  font-weight: bold;
}

:deep(.form-group input) {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.update-button {
  align-self: flex-start;
  padding: 10px 20px;
}

.message {
  margin-top: 20px;
  text-align: center;
  font-weight: bold;
}
</style>