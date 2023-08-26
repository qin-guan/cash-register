<script setup lang="ts">
import Step01 from './SetupStep01.vue'

const router = useRouter()

const step = computed({
  get() {
    try {
      return Number.parseInt(router.currentRoute.value.query.step as string ?? '-1')
    }
    catch {
      return -1
    }
  },
  set(value: number) {
    router.push({
      query: {
        step: value,
      },
    })
  },
})

const steps = [
  Step01,
]

function done() {
  if (step.value === steps.length - 1)
    router.push('/login')
  else
    step.value++
}
</script>

<template>
  <section class="py-16">
    <div class="h-16">
      <UButton v-if="step > -1" label="Back" color="gray" @click="step--">
        <template #leading>
          <UIcon name="i-tabler-arrow-left" />
        </template>
      </UButton>
    </div>

    <Transition appear>
      <div v-if="step === -1" class="space-y-6">
        <h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Your private money tracker.
        </h1>
        <p class="leading-7 text-neutral-400">
          Private, not straightforward and definitely easy to use. We promise you'll have a fun time here!
        </p>

        <UButton @click="step++">
          Begin setup
        </UButton>
      </div>

      <component :is="steps[step]" v-else @done="done" />
    </Transition>
  </section>
</template>

<style scoped>
.v-move,
.v-enter-active,
.v-leave-active {
  transition: all 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.v-leave-active {
  position: absolute;
}
</style>
