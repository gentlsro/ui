<script setup lang="ts">
import type { IToggleProps } from '../Toggle/types/toggle-props.type'

const { color, toggleDark } = useTheme()

const toggleUIProp = computed(() => {
  return {
    bulletClass: () => 'rounded-full bg-transparent',
    toggleClass: () => 'rounded-full border-1 border-ca hover:border-true-gray-400',
    icon: state => {
      if (state === 'checked') {
        return 'i-heroicons:sun-solid color-amber h-4 w-4'
      } else {
        return 'i-clarity:moon-solid color-light h-4 w-4'
      }
    },
  } as NonNullable<IToggleProps['ui']>
})
</script>

<template>
  <Toggle
    id="theme-toggle"
    :model-value="color"
    check-value="light"
    uncheck-value="dark"
    size="sm"
    m="!none"
    no-hover-effect
    :ui="toggleUIProp"
    @update:model-value="toggleDark()"
  />
</template>
