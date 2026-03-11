<script setup lang="ts">
import type { NonUndefined } from 'utility-types'

// Types
import type { IElementMovementProps } from './types/element-movement-props.type'

// Functions
import { useElementMovement } from './composables/useElementMovement'

defineProps<IElementMovementProps & {
  referenceEl?: any
}>()

// Template
const el = ref<HTMLElement>()

const dimensions = defineModel<NonUndefined<IElementMovementProps['dimensions']>>(
  'dimensions',
  { default: { x: 0, y: 0, w: 0, h: 0 } },
)

const { onMoveMouseDown } = useElementMovement({
  dimensions,
  referenceEl: el.value as unknown as HTMLElement,
})
</script>

<template>
  <div
    ref="el"
    class="element-movement contents"
    @mousedown="onMoveMouseDown"
  >
    <slot />
  </div>
</template>
