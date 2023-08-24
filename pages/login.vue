<script setup lang="ts">
import { FetchError } from 'ofetch'
import { z } from 'zod'

const schema = z.object({
  username: z.string().nonempty('Username must not be empty'),
  password: z.string().nonempty('Password must not be empty'),
})

const state = ref<{
  pending: boolean
  error: {
    username?: string
    password?: string
  }
}>({
  pending: false,
  error: {},
})

async function login(event: Event) {
  state.value.error = {}
  state.value.pending = true

  const formData = new FormData(event.currentTarget as HTMLFormElement)
  const result = await schema.safeParseAsync({
    username: formData.get('username'),
    password: formData.get('password'),
  })

  if (!result.success) {
    if (result.error.formErrors.fieldErrors.password)
      state.value.error.password = result.error.formErrors.fieldErrors.password[0]
    if (result.error.formErrors.fieldErrors.username)
      state.value.error.username = result.error.formErrors.fieldErrors.username[0]

    state.value.pending = false

    return
  }

  try {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: result.data,
    })
  }
  catch (err) {
    if (err instanceof FetchError)
      state.value.error.password = err.data.message

    state.value.error.password = JSON.stringify(err)
  }
  finally {
    state.value.pending = false
  }
}
</script>

<template>
  <UContainer class="h-full flex items-center justify-center flex-col space-y-8 mb-10">
    <span class="font-semibold dark:text-white text-neutral-900 text-xl">
      Login to Cash Register
    </span>
    <form class="space-y-4 w-64" @submit.prevent="login">
      <UFormGroup :error="state.error.username">
        <UInput name="username" placeholder="Username" />
      </UFormGroup>
      <UFormGroup :error="state.error.password">
        <UInput name="password" placeholder="Password" type="password" />
      </UFormGroup>
      <UButton block type="submit" :loading="state.pending">
        Login
      </UButton>
    </form>
  </UContainer>
</template>
