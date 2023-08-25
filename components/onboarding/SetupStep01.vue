<script setup lang="ts">
const { $client } = useNuxtApp()

async function create(event: Event) {
  const formData = new FormData(event.currentTarget as HTMLFormElement)
  await $client.onboarding.createInitialUser.mutate({
    username: formData.get('username') as string,
    password: formData.get('password') as string,
  })
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
    <div class="space-y-6">
      <h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Create a new user
      </h1>
      <p class="leading-7 text-neutral-400">
        This user will have full permissions. You can create more users later.
      </p>
    </div>

    <form class="space-y-4" @submit.prevent="create">
      <UFormGroup label="Username">
        <UInput name="username" placeholder="rickastley" />
      </UFormGroup>
      <UFormGroup label="Password">
        <UInput name="password" type="password" />
      </UFormGroup>
      <br>
      <UButton type="submit">
        Create
      </UButton>
    </form>
  </div>
</template>
