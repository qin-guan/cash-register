<template>
  <UContainer>
    <h1 center>Login</h1>
  </UContainer>
  <UCard>
    <form @submit.prevent="login">
      <UContainer>
        <label for="username">Username:</label>
        <UInput type="text" id="username" v-model="username" required />
      </UContainer>
      <UContainer>
        <label for="password">Password:</label>
        <UInput type="password" id="password" v-model="password" required />
      </UContainer>
      <br/>
      <UButton block type="submit">Login</UButton>
    </form>
  </UCard>
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
      // Store the token in localStorage
      setItem('authToken', response.token);
      // Redirect to the home page
      router.push('/');
    } else {
      throw new Error('No token received');
    }
  } catch (error) {
    console.error('Login error:', error);

    // Handle specific error for account not approved
    if (error.status === 403 && error.data?.statusMessage === 'Account not approved by admin') {
      alert('Your account is awaiting admin approval.');
    } else {
      alert('Invalid username or password');
    }
  }
}
</script>
