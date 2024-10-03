<template>
  <div class="settings-container">
    <h2 class="page-title">User Settings</h2>

    <UForm @submit.prevent="updateLogin" class="settings-form">
      <UFormGroup label="New Username" name="username">
        <UInput type="text" id="username" v-model="newUsername" required />
      </UFormGroup>
      <UFormGroup label="New Password" name="password">
        <UInput type="password" id="password" v-model="newPassword" required />
      </UFormGroup>
      <UButton type="submit" color="primary" class="update-button">Update Settings</UButton>
    </UForm>
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const newUsername = ref('');
const newPassword = ref('');
const message = ref('');
const { getItem } = useLocalStorage();

function updateLogin() {
  const token = getItem('authToken');

  fetch('/api/users/auth/updateLogin', {
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
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
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