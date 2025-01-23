<script setup lang="ts">
// Types
import type { ITextSplitterProps } from './types/text-splitter-props.type'

// Functions
import { getComponentProps } from '../../functions/get-component-props'

withDefaults(defineProps<ITextSplitterProps>(), {
  ...getComponentProps('textSplitter'),
})
</script>

<template>
  <div flex="~ gap-x-1">
    <template
      v-for="(part, idx) in modelValue"
      :key="idx"
    >
      <span>
        {{ part }}
      </span>
      <span v-if="idx !== modelValue.length - 1">{{ char }}</span>
    </template>
  </div>
</template>
