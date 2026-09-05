<script setup lang="ts" vapor>
import type { NonUndefined } from 'utility-types'

// Types
import type { IElementMovementProps } from './types/element-movement-props.type'

// Functions
import { useElementMovement } from './composables/useElementMovement'

defineProps<IElementMovementProps>()

const dimensions = defineModel<NonUndefined<IElementMovementProps['dimensions']>>(
  'dimensions',
  { default: () => ({ x: 0, y: 0, w: 0, h: 0 }) },
)

const moveHandle = useTemplateRef<HTMLDivElement>('moveHandle')

useElementMovement({
  moveHandle,
  dimensions,
})
</script>

<template>
  <div
    ref="moveHandle"
    class="element-movement contents touch-none"
  >
    <slot />
  </div>
</template>
