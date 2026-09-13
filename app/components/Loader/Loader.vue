<script setup lang="ts" vapor>
// Types
import type { ILoaderProps } from './types/loader-props.type'

// Components
import LoaderBlock from './LoaderBlock.vue'
import LoaderInline from './LoaderInline.vue'

const props = withDefaults(defineProps<ILoaderProps>(), {
  ...getComponentProps('loader'),
})

const LoaderComponent = computed(() => props.variant === 'inline'
  ? LoaderInline
  : LoaderBlock)
</script>

<template>
  <component
    :is="LoaderComponent"
    v-bind="$attrs"
  />
</template>
