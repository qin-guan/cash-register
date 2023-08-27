<script setup lang="ts">
definePageMeta({
  middleware: ['onboarding'],
})
</script>

<template>
  <div>
    <header class="bg-background/75 backdrop-blur border-b border-neutral-200 dark:border-neutral-800 -mb-px sticky top-0 z-50">
      <UContainer class="py-4">
        <NuxtLink to="/" class="font-bold text-sm">
          Cash Register
        </NuxtLink>
      </UContainer>
    </header>
    <main>
      <UContainer>
        Nothing here yet...
      </UContainer>
    </main>
  </div>
</template>
