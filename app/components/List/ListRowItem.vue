<script setup lang="ts" vapor>
// Types
import type { FloatingTarget } from '../../composables/useFloatingUIUtils'
import type { IListItem } from './types/list-item.type'
import type { IListProps } from './types/list-props.type'

// Functions
import { isListItemSelected } from './functions/helpers/is-list-item-selected'

// Store
import { useListStore } from './stores/list.store'

// Constants
import { LIST_DEFAULT_PROPS } from './constants/list-default-props.constant'

type ListMoveHandleExpose = {
  element: HTMLDivElement | null
}

type IProps = Pick<IListProps, 'ui' | 'noHover' | 'reorderable' | 'disabledFnc' | 'moveHandleTarget' | 'moveHandleTakesSpace'> & {
  item: IListItem
  isLast: boolean
}

const props = defineProps<IProps>()

// Store
const {
  listEl,
  createDraggable,
  addedItemById,
  itemFocused,
  rowComponent,
  selection,
  selectionConfig,
  dragMeta,
  groupBy,
  itemKey,
  emits,
  handleSelect,
} = useListStore()

// Utils
const { getElement } = useFloatingUIUtils()

// Layout
let dragEndFrame = 0
let unmounting = false
const el = useTemplateRef<FloatingTarget>('el')
const isDragging = ref(false)
const moveHandleEl = useTemplateRef<ListMoveHandleExpose>('moveHandleEl')
const item = toRef(props, 'item')

const isNew = computed(() => '_isNew' in item.value)

const isSelected = computed(() => {
  return isListItemSelected({
    item: item.value,
    selection: selection.value,
    itemKey: itemKey.value,
  })
})

const isDisabled = computed(() => props.disabledFnc?.(item.value))

function handleClick() {
  if (isDisabled.value || isDragging.value) {
    return
  }

  handleSelect(item.value)
  emits.value.itemClick(item.value)
}

// Root and handle are stable for the row's lifetime. Wait for the parent scroller ref.
let releaseDrag: ReturnType<typeof createDraggable> | undefined
onMounted(async () => {
  await nextTick()

  if (unmounting || isNew.value) {
    return
  }

  const row = getElement({ elRef: el.value })
  const container = listEl.value?.element
  const handle = moveHandleEl.value?.element
    ?? (row instanceof HTMLElement ? getElement({ elRef: props.moveHandleTarget, parentEl: row }) : null)

  if (!(row instanceof HTMLElement) || !(container instanceof HTMLElement) || !(handle instanceof HTMLElement)) {
    return
  }

  releaseDrag = createDraggable({
    el: row,
    containerEl: container,
    moveHandleEl: handle,
    itemId: item.value.id,
    canDrag: () => !isNew.value && !isDisabled.value && !!(typeof props.reorderable === 'function'
      ? props.reorderable(item.value.ref)
      : props.reorderable),
    onDragStart: () => {
      cancelAnimationFrame(dragEndFrame)
      isDragging.value = true
    },
    onDragEnd: () => {
      if (!unmounting) {
        cancelAnimationFrame(dragEndFrame)
        dragEndFrame = requestAnimationFrame(() => isDragging.value = false)
      }
    },
  })
})

onBeforeUnmount(() => {
  unmounting = true
  cancelAnimationFrame(dragEndFrame)
  // Virtualization may remove the row while the List still owns its active drag.
  releaseDrag?.(!!dragMeta.value.isVirtualScroll)
})

// Styles - Row
const rowClass = computed(() => {
  return props.ui?.rowClass?.({
    groupsCount: groupBy.value.length,
    row: item.value.ref,
    isLast: props.isLast,
    defaults: LIST_DEFAULT_PROPS.ui.rowClass(),
  })
})

const rowClassLocal = computed(() => {
  const sourceElId = dragMeta.value.sourceEl?.dataset.id

  const isReorderable = typeof props.reorderable === 'function'
    ? props.reorderable(item.value.ref)
    : props.reorderable

  return {
    'is-reorderable': isReorderable,
    'move-handle-takes-space': props.moveHandleTakesSpace,
    'is-selected': isSelected.value,
    'is-focused': itemFocused.value?.id === item.value?.id,
    'is-selectable': selectionConfig.value?.enabled,
    'is-added': !!addedItemById.value[item.value.id],
    'is-new': isNew.value,
    'is-dragging': sourceElId === String(item.value?.id),
    'no-hover': props.noHover,
    'uses-checkbox': selectionConfig.value?.useCheckbox,
    'is-disabled disabled': isDisabled.value,
    'is-multi': !!selectionConfig.value?.multi,
  }
})

const rowStyle = computed(() => {
  return props.ui?.rowStyle?.({
    groupsCount: groupBy.value.length,
    row: item.value.ref,
    isLast: props.isLast,
  })
})

// Styles - Row Content
const rowContentClass = computed(() => {
  return props.ui?.rowContentClass?.({
    row: item.value.ref,
    groupsCount: groupBy.value.length,
    isLast: props.isLast,
    defaults: LIST_DEFAULT_PROPS.ui.rowContentClass(),
  })
})

const rowContentStyle = computed(() => {
  return props.ui?.rowContentStyle?.({
    row: item.value.ref,
    groupsCount: groupBy.value.length,
    isLast: props.isLast,
  })
})
</script>

<template>
  <Component
    :is="rowComponent"
    ref="el"
    :data-id="item.id"
    :data-selected="isSelected"
    data-cy="item-selectable"
    class="list-row-item"
    :class="[rowClass, rowClassLocal]"
    :style="rowStyle"
    @click="handleClick"
  >
    <ListMoveHandle
      v-if="!isNew && !moveHandleTarget"
      ref="moveHandleEl"
      class="list-move-handle"
      :ui
    >
      <slot name="move-handle" />
    </ListMoveHandle>

    <!-- Selection when using checkbox -->
    <slot
      name="checkbox"
      :is-disabled
    >
      <Checkbox
        v-if="selectionConfig?.useCheckbox"
        :model-value="isSelected"
        :disabled="isDisabled"
        class="list-row-item__selection-checkbox"
        size="sm"
        v-bind="selectionConfig?.checkboxProps"
      />
    </slot>

    <slot
      :is-disabled
      :is-selected
    >
      <div
        class="list-row-item__content"
        :class="rowContentClass"
        :style="rowContentStyle"
      >
        <span
          class="break-words text-wrap"
          v-html="item._highlighted"
        />

        <!-- New item -->
        <span class="list-row-item__content-new">
          <div class="icon" />

          <span>
            {{ isNew ? $t('general.newItem') : $t('general.addedItem') }}
          </span>
        </span>
      </div>
    </slot>
  </Component>
</template>

<style lang="scss" scoped>
.list-row-item__content-new {
  @apply hidden text-caption font-rem-12;
}

.list-row-item__selection-checkbox {
  @apply self-start shrink-0 pointer-events-none;
}

.list-row-item {
  &.is-dragging {
    @apply outline-2 outline-primary outline-dashed outline-offset--2 bg-primary/30;

    &::after {
      @apply content-empty absolute inset-0 bg-primary rounded-inherit;
    }
  }

  &.is-added,
  &.is-new {
    .list-row-item__content-new {
      @apply flex gap-1 items-center font-rem-12 text-caption;
    }
  }

  &.is-new {
    .icon {
      @apply i-eva:plus-fill w-4 h-4 leading-none;
    }
  }

  &.is-added {
    .icon {
      @apply i-gg:add w-4 h-4 leading-none;
    }
  }

  &.is-selectable {
    @apply cursor-pointer;
  }

  &:not(.is-reorderable) {
    .list-move-handle {
      @apply hidden;
    }

    &.move-handle-takes-space .list-move-handle {
      @apply invisible flex;
    }
  }
}
</style>
