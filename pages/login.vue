<script setup lang="ts">
function login(event: Event) {
  const formData = new FormData(event.currentTarget as HTMLFormElement)
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }
}
</script>

<template>
  <div class="h-full flex items-center justify-center flex-col space-y-4">
    <span class="font-semibold dark:text-white text-neutral-900 text-xl">
      Login to Cash Register
    </span>
    <form class="space-y-4" @submit.prevent="login">
      <UInput name="email" placeholder="Email" type="email" />
      <UInput name="password" placeholder="Password" type="password" />
      <UButton block type="submit">
        Login
      </UButton>
    </form>
  </div>
</template>
