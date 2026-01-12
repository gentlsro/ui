<script setup lang="ts">
// Types
import type { IListProps } from './types/list-props.type'

// Constants
import { LIST_DEFAULT_PROPS } from './constants/list-default-props.constant'

type IProps = Pick<IListProps, 'ui'>

const props = defineProps<IProps>()

const moveHandleClass = computed(() => {
  return props.ui?.moveHandleClass?.({
    defaults: LIST_DEFAULT_PROPS.ui.moveHandleClass(),
  })
})

const moveHandleStyle = computed(() => {
  return props.ui?.moveHandleStyle?.()
})

const moveHandleIconClass = computed(() => {
  return props.ui?.moveHandleIconClass?.({
    defaults: LIST_DEFAULT_PROPS.ui.moveHandleIconClass(),
  })
})

const moveHandleIconStyle = computed(() => {
  return props.ui?.moveHandleIconStyle?.()
})
</script>

<template>
  <div
    class="list-move-handle"
    :class="moveHandleClass"
    :style="moveHandleStyle"
    @click.stop.prevent
  >
    <slot>
      <div
        class="list-move-handle__icon"
        :class="moveHandleIconClass"
        :style="moveHandleIconStyle"
      />
    </slot>
  </div>
</template>

<style scoped lang="scss">
.list-row-item.is-dragging .list-move-handle {
  @apply cursor-grabbing;
}
</style>
