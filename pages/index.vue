<script setup lang="ts">
const { $client } = useNuxtApp()
const { data: onboarding, pending, error } = await $client.onboarding.status.useLazyQuery()
</script>

<template>
  <UContainer>
    <div v-if="pending">
      <!-- TODO some skeleton here -->
    </div>
    <template v-else>
      <LazyOnboardingSetup v-if="!onboarding?.completed" />

      <div v-else class="items-center justify-center flex h-full flex-col space-y-10">
        <h1 class="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight text-center">
          Imagine a nice landing page here
        </h1>

        <UButton to="/login">
          Login
        </UButton>
      </div>
    </template>
  </UContainer>
</template>
