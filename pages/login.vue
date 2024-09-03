<template>
  <div class="container">
    <UCard class="login-card">
      <h1 class="text-center mb-lg">Login</h1>
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="username" class="form-label">Username:</label>
          <UInput
            type="text"
            id="username"
            v-model="username"
            class="form-input"
            required
          />
        </div>
        <div class="form-group">
          <label for="password" class="form-label">Password:</label>
          <UInput
            type="password"
            id="password"
            v-model="password"
            class="form-input"
            required
          />
        </div>
        <UButton
          type="submit"
          color="primary"
          block
          class="btn btn-primary login-button"
        >
          Login
        </UButton>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const router = useRouter();
const { setItem } = useLocalStorage();

async function login() {
  try {
    const response = await $fetch('/api/users/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    });

    if (response.token) {
      setItem('authToken', response.token);
      router.push('/');
    } else {
      throw new Error('No token received');
    }
  } catch (error) {
    console.error('Login error:', error);

    if (error.status === 403 && error.data?.statusMessage === 'Account not approved by admin') {
      alert('Your account is awaiting admin approval.');
    } else {
      alert('Invalid username or password');
    }
  }
}
</script>

<style scoped>
.login-card {
  max-width: 400px;
  margin: var(--spacing-xl) auto;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.login-button {
  margin-top: var(--spacing-md);
}
</style>
