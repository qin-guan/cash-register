<template>
  <div class="set-password-modal">
    <h2 class="text-center mb-lg">Set Your Password</h2>
    <form @submit.prevent="setPassword" class="set-password-form">
      <div class="form-group">
        <label for="password" class="form-label">New Password:</label>
        <UInput
          type="password"
          id="password"
          v-model="password"
          class="form-input"
          required
        />
      </div>
      <div class="form-group">
        <label for="confirmPassword" class="form-label">Confirm Password:</label>
        <UInput
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          class="form-input"
          required
        />
      </div>
      <UButton
        type="submit"
        color="primary"
        block
        class="btn btn-primary set-password-button"
      >
        Set Password
      </UButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  username: string;
}>();

const emit = defineEmits(['passwordSet']);

const password = ref('');
const confirmPassword = ref('');
const currentUserId = ref('');

watch(() => props.username, (newUsername) => {
  console.log('Received new username in SetPassword:', newUsername);
  currentUserId.value = newUsername;
}, { immediate: true });

async function setPassword() {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match');
    return;
  }

  try {
    console.log('Attempting to set password for username:', currentUserId.value);
    const response = await $fetch('/api/users/auth/setPassword', {
      method: 'POST',
      body: { username: currentUserId.value, password: password.value },
    });

    if (response.success) {
      emit('passwordSet');
    } else {
      throw new Error('Failed to set password');
    }
  } catch (error) {
    console.error('Set password error:', error);
    alert('An error occurred while setting the password');
  }
}
</script>

<style scoped>
.set-password-modal {
  padding: var(--spacing-md);
}

.set-password-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.set-password-button {
  margin-top: var(--spacing-md);
}
</style>
