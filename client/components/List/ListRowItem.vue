<script setup lang="ts">
// Types
import type { IListItem } from './types/list-item.type'
import type { IListProps } from './types/list-props.type'

// Functions
import { isListItemSelected } from './functions/helpers/is-list-item-selected'

// Store
import { useListStore } from './stores/list.store'
import { useListDragAndDrop } from './composables/useListDragAndDrop'
import { useFloatingUIUtils } from '../FloatingUI/functions/useFloatingUIUtils'

type IProps = Pick<IListProps, 'ui' | 'noHover' | 'reorderable' | 'disabledFnc' | 'moveHandleTarget'> & {
  item: IListItem
  isLast: boolean
}

const props = defineProps<IProps>()

// Store
const listStore = useListStore()
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
} = storeToRefs(listStore)

// Utils
const { createDraggable } = useListDragAndDrop()
const { getElement } = useFloatingUIUtils()

// Layout
const el = useTemplateRef('el')
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

const rowProps = computed(() => {
  const sourceElId = dragMeta.value.sourceEl?.dataset.id

  const isReorderable = typeof props.reorderable === 'function'
    ? props.reorderable(item.value.ref)
    : props.reorderable

  return {
    class: [
      props.ui?.rowClass?.({
        isSelected: isSelected.value,
        groupsCount: groupBy.value.length,
        row: item.value.ref,
        isLast: props.isLast,
      }),
      {
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
      },
    ],
    style: props.ui?.rowStyle?.({
      isSelected: isSelected.value,
      groupsCount: groupBy.value.length,
      row: item.value.ref,
      isLast: props.isLast,
    }),
  }
})

function handleClick() {
  if (isDisabled.value) {
    return
  }

  listStore.handleSelect(item.value)
  emits.value.itemClick(item.value)
}

// D'n'D
onMounted(() => {
  nextTick(() => {
    if (isNew.value) {
      return
    }

    const _el = unrefElement(el as any) as HTMLElement
    const listElDom = unrefElement(listEl as any)
    const moveHandleElDom = unrefElement(moveHandleEl as any)
      ?? getElement(props.moveHandleTarget, _el)

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
    data-cy="item-selectable"
    class="list-row-item"
    :class="rowProps.class"
    :style="rowProps.style"
    @click="handleClick"
  >
    <ListMoveHandle
      v-if="!isNew && !moveHandleTarget"
      ref="moveHandleEl"
      class="list-move-handle"
      :class="ui?.moveHandleClass"
      :style="ui?.moveHandleStyle"
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
        :editable="!isDisabled"
        class="list-row-item__selection-checkbox"
      />
    </slot>

    <slot :is-disabled="isDisabled">
      <div class="list-row-item__content">
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
.list-row-item {
  @apply relative flex gap-x-2 cursor-default select-none items-center w-full;
  @apply min-h-$defaultRowHeight;

  &__content {
    @apply flex flex-col grow overflow-hidden;

    &-new {
      @apply hidden text-caption font-rem-12;
    }
  }

  &__selection-checkbox {
    @apply shrink-0 pointer-events-none;
  }

  &.is-dragging {
    @apply outline-2 outline-primary outline-dashed outline-offset--2 bg-primary/30;

    &::after {
      @apply content-empty absolute inset-0 bg-primary rounded-inherit;
    }
  }

  &.is-added,
  &.is-new {
    .list-row-item__content-new {
      @apply flex gap-1 items-center;
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

  &.is-selected:not(.uses-checkbox) {
    @apply dark:bg-primary/50 bg-primary/20 light:color-primary;
  }

  &.is-focused:not(.no-hover),
  &.is-selectable:not(.no-hover):hover {
    @apply bg-primary/25;
  }

  &:not(.is-reorderable) {
    .list-move-handle {
      @apply hidden;
    }
  }

  &:not(.is-selectable) {
    .list-row-item__selection-checkbox {
      @apply hidden;
    }
  }
}
</style>
