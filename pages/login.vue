<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="username" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit">Login</button>
    </form>
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
    const response = await $fetch('/api/auth/login', {
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
    alert('Invalid username or password');
  }
}
</script>
