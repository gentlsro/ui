<script setup lang="ts">
import type { ComparatorEnum } from '$comparatorEnum'

// Types
import type { IQueryBuilderItem, IQueryBuilderItemProps } from './types/query-builder-item-props.type'

// Models
import type { TableColumn } from '../Table/models/table-column.model'

// Store
import { useQueryBuilderStore } from './query-builder.store'

// Constants
import { useQueryBuilderItemUtils } from './functions/useQueryBuilderItemUtils'

const props = defineProps<IQueryBuilderItemProps>()
const emits = defineEmits<{
  (e: 'delete:row', item: IQueryBuilderItem): void
  (e: 'update:comparator', comparator: ComparatorEnum): void
}>()

defineExpose({
  focusInput: (input: 'field' | 'comparator' | 'value' = 'value') => {
    switch (input) {
      case 'field':
        fieldInputEl.value?.focus?.()
        break

      case 'comparator':
        comparatorInputEl.value?.focus?.()
        break

      case 'value':
        valueInputEl.value?.focus?.()
        break
    }
  },
})

// Store
const {
  columns,
  draggedItem,
  items,
  hoveredItem,
  isSmallerScreen,
  getFilterComponentFnc,
} = storeToRefs(useQueryBuilderStore())

// Layout
const fieldInputEl = useTemplateRef('fieldInputEl')
const comparatorInputEl = useTemplateRef('comparatorInputEl')
const valueInputEl = ref<any>()
const item = toRef(props, 'item') as Ref<IQueryBuilderItem>

const { isNonValueComparator, canUseSelectorComparator } = useQueryBuilderItemUtils(item)

const colSelected = computed(() => {
  return columns.value.find(col => col.field === item.value.field) as TableColumn<any>
})

const customFilterComponent = computed(() => {
  const customFilterComponent = colSelected.value?.filterComponent
  const isValidComparator = customFilterComponent?.comparators.includes(item.value.comparator)

  // When using a comparator that is defined to have a custom filter component, we use it
  if (customFilterComponent && isValidComparator) {
    return customFilterComponent
  }

  // When using a `getFilterComponent` prop, we use it
  if (getFilterComponentFnc.value && colSelected.value) {
    return getFilterComponentFnc.value(colSelected.value, item.value)
  }

  // Otherwise, we don't return anything
  return undefined
})

function handleRemoveCondition() {
  if (props.removeFnc) {
    props.removeFnc({ ...item.value, misc: { column: colSelected.value } })

    return
  }

  const idx = item.value.path.split('.').pop()
  const parentPath = item.value.path.split('.').slice(0, -2).join('.')
  const parent = get(toValue(items), parentPath)

  parent.children = parent.children.toSpliced(idx, 1)

  emits('delete:row', item.value)
}

function handleFieldChange(field: string) {
  const col = columns.value.find(col => col.field === field)

  if (!col) {
    return
  }

  // NOTE: When datatype changes OR we're using non-primitive comparators, we reset value
  const cfc = customFilterComponent.value // cfc ~ customFilterComponent abbreviation
  const isNonPrimitiveComparator = (cfc && !cfc.comparators)
    || cfc?.comparators?.includes(item.value.comparator)
    || canUseSelectorComparator(item.value.comparator, colSelected.value || col)

  if (
    col.dataType !== colSelected.value?.dataType
    || isNonPrimitiveComparator
  ) {
    item.value.value = undefined
  }

  item.value.field = field
  item.value.comparator = col.comparator
  item.value.filterField = col.filterField
}

function handleComparatorChange() {
  // Focus value input
  nextTick(() => valueInputEl.value?.focus?.())
}

// Validation
const $z = useZod(
  {
    item: z.object({
      field: z.string(),
      comparator: z.string(),
      value: z.unknown().refine(val => {
        if (isNonValueComparator.value) {
          return isNil(val)
        }

        return !isNil(val)
      }),
    }),
  },
  { item },
  { scope: 'qb' },
)
</script>

<template>
  <li
    class="qb-row qb-item"
    :class="{
      'is-hovered': hoveredItem === item,
      'is-dragged': draggedItem?.row === item,
      'is-last-child': isLastChild,
      'no-drag': noDraggable || item.isNotDraggable,
      'no-dragover': item.isNotDragOverable,
      'is-smaller-screen': isSmallerScreen,
    }"
    :data-path="item.path"
    data-cy="qb-row"
    @mouseover.stop="hoveredItem = item"
    @mouseleave="hoveredItem = undefined"
  >
    <!-- Move handler -->
    <QueryBuilderMoveHandler
      v-if="!noDraggable && !item.isNotDraggable && editable"
      self-start
      m="t-2.5"
    />

    <div class="qb-item__content">
      <!-- Field selector -->
      <Selector
        ref="fieldInputEl"
        :model-value="item.field"
        :options="columns"
        emit-key
        size="sm"
        option-key="field"
        option-label="_label"
        :readonly="!editable"
        class="qb-item__content-field"
        :validation="$z.item.field"
        data-cy="qb-item__content-field"
        @update:model-value="handleFieldChange"
      >
        <template #option="{ item }">
          <QueryBuilderItemDataTypeShortcut
            :data-type="item.ref.dataType"
            class="relative top-1"
            self-start
            shrink-0
            m="t-1.5"
          />

          <span p="y-1.5">
            {{ item.ref._label }}
          </span>
        </template>

        <template
          v-if="colSelected"
          #prepend
        >
          <div
            flex="~ center"
            m="l-1"
          >
            <QueryBuilderItemDataTypeShortcut :data-type="colSelected.dataType" />
          </div>
        </template>
      </Selector>

      <template v-if="item.field && colSelected">
        <TableHeaderColumnFilteringComparator
          ref="comparatorInputEl"
          :column="colSelected"
          :item
          :editable
          class="qb-item__content-comparator"
          :extra-comparators="customFilterComponent?.comparators"
          :validation="$z.item.comparator"
          @update:comparator="handleComparatorChange"
        />

        <div
          :key="colSelected.field"
          flex="~"
        >
          <TableHeaderColumnFilteringValue
            ref="valueInputEl"
            :column="colSelected"
            :item
            :editable
            :validation="$z.item.value"
            class="qb-item__content-value"
          />
        </div>
      </template>
    </div>

    <!-- Remove condition -->
    <Btn
      v-if="!noRemove && editable"
      size="xs"
      preset="TRASH"
      m="t-2 r-2"
      self="start"
      tabindex="-1"
      @click="handleRemoveCondition"
    />

    <slot name="append" />
  </li>
</template>

<style scoped lang="scss">
.qb-item {
  @apply relative flex gap-2 rounded-custom p-l-2 min-h-10 m-r-2 m-l-5
    items-center bg-ca border-1 border-transparent;

  transition:
    background-color 0.3s ease-in-out,
    shadow 0.3s ease-in-out;

  &.is-hovered {
    @apply bg-white dark:bg-darker z-1 shadow-consistent shadow-ca;
  }

  &.is-dragged {
    @apply bg-primary/15 dark:bg-primary/15;
  }

  &.is-smaller-screen .qb-item__content {
    @apply flex-col;
  }

  &:not(.is-smaller-screen) .qb-item__content {
    &-field {
      @apply w-60 shrink-0;
    }

    &-comparator {
      @apply w-55 shrink-0;
    }

    &-value {
      @apply min-w-60;
    }
  }

  &__content {
    @apply flex gap-1 grow p-y-1;

    &-field,
    &-comparator {
      @apply max-w-80;
    }
  }

  &.is-smaller-screen {
    .qb-item__content-value {
      @apply min-w-80;
    }
  }
}

.qb-item:not(.no-drag) {
  &::before {
    @apply absolute content-empty -left-3 top-0 h-full;
    @apply border-l-1 border-dark dark:border-ca border-dashed;
  }

  &::after {
    @apply absolute content-empty -left-3 w-3;
    @apply border-b-1 border-dark dark:border-ca border-dashed;

    // This is kinda specificut it shouldn't really cause issues if we
    // don't mess with int sizes
    @apply top-19.5px;
  }
}

.qb-item.is-last-child::before {
  @apply h-19.5px;
}
</style>
