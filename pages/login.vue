<template>
  <div class="container">
    <UCard class="login-card">
      <h1 class="text-center mb-lg">{{ isFirstUser ? 'Welcome' : 'Login' }}</h1>
      <div v-if="isFirstUser">
        <p>It looks like you're the first user. Let's set up your admin account.</p>
        <UButton @click="showSetupModal = true" color="primary" block>
          Set Up Admin Account
        </UButton>
      </div>
      <form v-else @submit.prevent="checkUser" class="login-form">
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
        <div v-if="showPasswordField" class="form-group">
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
          {{ showPasswordField ? 'Login' : 'Continue' }}
        </UButton>
      </form>
    </UCard>

    <UModal v-model="showSetPasswordModal">
      <SetPassword :userId="userId" @passwordSet="onPasswordSet" />
    </UModal>

    <UModal v-model="showSetupModal">
      <SetupAdminAccount @accountSetup="onAccountSetup" />
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SetPassword from './components/SetPassword.vue';
import SetupAdminAccount from './components/SetupAdminAccount.vue';

const username = ref('');
const password = ref('');
const router = useRouter();
const { setItem } = useLocalStorage();
const showSetPasswordModal = ref(false);
const userId = ref('');
const isFirstUser = ref(false);
const showSetupModal = ref(false);
const showPasswordField = ref(false);

onMounted(async () => {
  await checkFirstUser();
});

async function checkFirstUser() {
  try {
    const response = await $fetch('/api/users/auth/checkFirstUser', {
      method: 'GET',
    });
    isFirstUser.value = response.isFirstUser;
    if (isFirstUser.value) {
      showSetupModal.value = true;
    }
  } catch (error) {
    console.error('Error checking first user:', error);
  }
}

async function checkUser() {
  if (!showPasswordField.value) {
    try {
      const response = await $fetch('/api/users/auth/login', {
        method: 'POST',
        body: { username: username.value },
      });

      if (!response.userExists) {
        showSetPasswordModal.value = true;
      } else if (response.needsPasswordReset) {
        userId.value = response.userId;
        showSetPasswordModal.value = true;
      } else {
        showPasswordField.value = true;
      }
    } catch (error) {
      console.error('Error checking user:', error);
      alert('An error occurred. Please try again.');
    }
  } else {
    await login();
  }
}

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

function onPasswordSet() {
  showSetPasswordModal.value = false;
  showPasswordField.value = true;
  alert('Password set successfully. Please log in with your new password.');
}

function onAccountSetup() {
  showSetupModal.value = false;
  alert('Admin account set up successfully. Please log in with your new credentials.');
  isFirstUser.value = false;
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
