<script setup lang="ts">
// Types
import type { ITabProps } from './types/tab-props.type'

defineOptions({ name: 'Tab' })

defineProps<ITabProps>()
</script>

<template>
  <div class="tab">
    <slot />
  </div>
</template>
