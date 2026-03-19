<script setup lang="ts">
// Types
import type { IListItem } from './types/list-item.type'
import type { IListProps } from './types/list-props.type'

// Functions
import { isListItemSelected } from './functions/helpers/is-list-item-selected'

// Store
import { useListStore } from './stores/list.store'
import { useListDragAndDrop } from './composables/useListDragAndDrop'

// Constants
import { LIST_DEFAULT_PROPS } from './constants/list-default-props.constant'

type IProps = Pick<IListProps, 'ui' | 'noHover' | 'reorderable' | 'disabledFnc' | 'moveHandleTarget'> & {
  item: IListItem
  isLast: boolean
}

const props = defineProps<IProps>()

// Store
const {
  listEl,
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
const { createDraggable } = useListDragAndDrop({
  onDragEnd: () => requestAnimationFrame(() => isDragging.value = false),
})

// Layout
const el = useTemplateRef('el')
const isDragging = ref(false)
const moveHandleEl = useTemplateRef('moveHandleEl')
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

// D'n'D
onMounted(() => {
  nextTick(() => {
    if (isNew.value) {
      return
    }

    const _el = unrefElement(el as any) as HTMLElement
    const listElDom = unrefElement(listEl as any)
    const moveHandleElDom = unrefElement(moveHandleEl as any)
      ?? getElement({ elRef: props.moveHandleTarget, parentEl: _el })

    createDraggable({
      el: _el,
      containerEl: listElDom,
      itemId: item.value.id,
      moveHandleEl: moveHandleElDom,
    })
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
      @mousedown="isDragging = true"
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
          break-words
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
  }
}
</style>
