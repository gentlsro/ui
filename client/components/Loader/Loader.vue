<script setup lang="ts">
// Types
import type { ILoaderProps } from './types/loader-props.type'

// Functions
import { getComponentProps } from '../../functions/get-component-props'

// Components
import LoaderBlock from './LoaderBlock.vue'
import LoaderInline from './LoaderInline.vue'

const props = withDefaults(defineProps<ILoaderProps>(), {
  ...getComponentProps('loader'),
})

const LoaderComponent = props.variant === 'inline'
  ? LoaderInline
  : LoaderBlock
</script>

<template>
  <component
    :is="LoaderComponent"
    v-bind="$attrs"
  />
</template>
