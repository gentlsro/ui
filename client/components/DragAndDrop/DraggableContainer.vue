<script setup lang="ts" generic="T extends IItem">
import { moveItem } from '$utils'

// Types
import type { IDragAndDropProps } from './types/drag-and-drop-props.type'

// Functions
import { useDragAndDrop } from './functions/useDragAndDrop'

const props = withDefaults(defineProps<IDragAndDropProps<T>>(), {
  direction: 'vertical',
  itemKey: 'id' as ObjectKey<T>,
})

const emits = defineEmits<{
  (e: 'update:items', items: T[]): void
  (e: 'insert:item', payload: { item: T, idx: number }): void
  (e: 'remove:item', item: T): void
}>()

// Utils
const { handleMouseDown, handleTouchStart } = useDragAndDrop(props)

// Layout
const isNoDrop = defineModel<boolean>('noDrop', { default: false })
const model = defineModel<T[]>('items')

const classes = computed(() => {
  return {
    'is-horizontal': props.direction === 'horizontal',
    'is-vertical': props.direction === 'vertical',
    'no-drop': isNoDrop.value,
  }
})

// Scrolling
const scrollEl = ref<HTMLDivElement>()
const { arrivedState } = useScroll(scrollEl)

function handleWheel(ev: WheelEvent) {
  // Scrolling down
  if (ev.deltaY > 0 && !arrivedState.bottom) {
    ev.stopPropagation()
  }

  // Scrolling up
  else if (ev.deltaY < 0 && !arrivedState.top) {
    ev.stopPropagation()
  }
}

// Items handling
function getItemKey(item: T) {
  return typeof props.itemKey === 'function'
    ? props.itemKey(item)
    : get(item, props.itemKey as any)
}

function getItems() {
  return model.value
}

function getParent() {
  return props.parent
}

function insertItem(idx: number, item: T) {
  model.value = model.value?.toSpliced(idx, 0, item)

  emits('insert:item', { item, idx })
}

function removeItem(item: T) {
  model.value = model.value?.filter(i => i !== item)

  emits('remove:item', item)
}

function handleMoveItem(fromIdx: number, toIdx: number) {
  model.value = moveItem(model.value || [], fromIdx, toIdx)
}

function disableDrop() {
  isNoDrop.value = true
}

function enableDrop() {
  isNoDrop.value = false
}
</script>

<template>
  <div
    ref="scrollEl"
    class="draggable-container"
    data-draggable-container="true"
    :class="classes"
    .getItems="getItems"
    .removeItem="removeItem"
    .insertItem="insertItem"
    .moveItem="handleMoveItem"
    .getParent="getParent"
    .disableDrop="disableDrop"
    .enableDrop="enableDrop"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
    @wheel="handleWheel"
  >
    <DraggableItem
      v-for="(item, idx) in model"
      :key="getItemKey(item)"
      :item
    >
      <template #default>
        <slot
          :item
          :idx
        />
      </template>
    </DraggableItem>
  </div>
</template>

<style lang="scss" scoped>
.draggable-container {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;

  @apply relative flex overflow-y-auto overflow-x-hidden;
  touch-action: auto;

  &.is-vertical {
    @apply flex-col;
  }

  &.is-horizontal {
    @apply flex-row;
  }

  &.no-drop {
    @apply opacity-25;
  }
}
</style>
