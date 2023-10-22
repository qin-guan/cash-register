<script setup lang="ts">
import { z } from 'zod'
import type { TRPCClientError } from '~/shared/types'

const emit = defineEmits(['done'])

const { $client } = useNuxtApp()
const toast = useToast()

const schema = z.object({
  username: z.string().min(1, 'Username must not be empty'),
  password: z.string().min(1, 'Password must not be empty'),
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

async function create(event: Event) {
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
    await $client.onboarding.createInitialUser.mutate({
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    })
    emit('done')
  }
  catch (_err) {
    const err = _err as TRPCClientError
    toast.add({
      title: 'Error creating user',
      description: err.data?.code,
      color: 'rose',
    })
  }
  finally {
    state.value.pending = false
  }
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
      <UFormGroup label="Username" :error="state.error.username">
        <UInput name="username" placeholder="rickastley" />
      </UFormGroup>
      <UFormGroup label="Password" :error="state.error.password">
        <UInput name="password" type="password" />
      </UFormGroup>
      <br>
      <UButton type="submit" :loading="state.pending">
        Create
      </UButton>
    </form>
  </div>
</template>
