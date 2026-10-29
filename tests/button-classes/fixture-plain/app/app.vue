<script setup lang="ts">
const hydrated = ref(false)
onMounted(() => {
  hydrated.value = true
})
const builtinBase = (value: 'flex items-center tracking-wide relative select-none') => value
</script>

<template>
  <main>
    <h1>Standalone Button defaults</h1>
    <output data-testid="hydrated">{{ hydrated }}</output>
    <Btn
      data-testid="plain-button"
      label="Plain Button"
      size="sm"
      :no-hover-effect="true"
    />
    <Btn
      data-testid="plain-picked-button"
      label="Plain picker"
      :no-hover-effect="true"
      :ui="{ containerClass: ({ defaults }) => `${builtinBase(defaults.base)} ${defaults.p('bold')}` }"
    />
  </main>
</template>
