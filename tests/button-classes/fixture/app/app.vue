<script setup lang="ts">
const size = ref<'sm' | 'lg'>('sm')
const expectedBase = (value: 'app-base') => value
const expectedSize = (value: 'app-sm') => value
const hydrated = ref(false)
onMounted(() => {
  hydrated.value = true
})
</script>

<template>
  <main>
    <h1>Button layer defaults</h1>
    <output data-testid="hydrated">{{ hydrated }}</output>
    <Btn
      data-testid="merged-button"
      label="Merged classes"
      :size
      :no-hover-effect="true"
    />
    <Btn
      data-testid="independent-button"
      label="Independent large button"
      size="lg"
      :no-hover-effect="true"
    />
    <Btn
      data-testid="picked-button"
      label="Picked classes"
      :size
      :no-hover-effect="true"
      :ui="{
        containerClass: ({ defaults }) => [
          expectedBase(defaults.base),
          expectedSize(defaults.sizes.sm),
          defaults.p('base', 'theme', 'brand', 'app'),
        ].join(' '),
      }"
    />
    <Btn
      data-testid="size-toggle"
      label="Toggle size"
      :no-hover-effect="true"
      @click="size = size === 'sm' ? 'lg' : 'sm'"
    />
  </main>
</template>
