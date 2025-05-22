<script setup lang="ts">
import { getActivePinia } from 'pinia'

// Types
import type { IQueryBuilderProps } from './types/query-builder-props.type'
import type { IQueryBuilderEmits } from './types/query-builder-emits.type'

// Functions
import { getComponentProps } from '../../functions/get-component-props'
import { useQueryBuilderDragAndDrop } from './functions/useQueryBuilderDragAndDrop'
import { useQueryBuilderColumnFilters } from './functions/useQueryBuilderColumnFilters'

// Store
import { queryBuilderIdKey, useQueryBuilderStore } from './query-builder.store'
import { queryBuilderInitializeItems } from './functions/query-builder-initialize-items'

const props = withDefaults(defineProps<IQueryBuilderProps>(), {
  ...getComponentProps('queryBuilder'),
})

defineEmits<IQueryBuilderEmits>()

const uuid = injectLocal(queryBuilderIdKey, useId())

provideLocal(queryBuilderIdKey, uuid)

// Store
const store = useQueryBuilderStore({ queryBuilderProps: props })
const {
  columns: storeColumns,
  items: storeItems,
  maxNestingLevel: storeMaxNestingLevel,
  queryBuilderEl,
  draggedItem,
  isSmallerScreen,
  breakpoint: storeBreakpoint,
  getFilterComponentFnc: storeGetFilterComponentFnc,
} = storeToRefs(store)

// Utils
useQueryBuilderDragAndDrop()

// Layout
const items = defineModel<IQueryBuilderProps['items']>('items', { required: true })
const level = 0

function clearFilter() {
  items.value = [
    {
      id: generateUUID(),
      isGroup: true,
      children: [],
      condition: 'AND',
      path: '0',
    },
  ]
}

// Column filters
const {
  columnFilters,
  hasColumnFilters,
  removeColumnFilter,
  getModifiedColumnFilters,
  getModifiedColumnFilter,
} = useQueryBuilderColumnFilters(props)

// Init
const columns = toRef(props, 'columns')
const maxNestingLevel = toRef(props, 'maxLevel')

syncRef(columns, storeColumns, { direction: 'ltr' })
syncRef(items, storeItems, { direction: 'both' })
syncRef(maxNestingLevel, storeMaxNestingLevel, { direction: 'ltr' })
syncRef(toRef(props, 'breakpoint', 1024), storeBreakpoint, { direction: 'ltr' })
syncRef(toRef(props, 'getFilterComponent'), storeGetFilterComponentFnc, { direction: 'ltr' })

// Lifecycle
// When no items are provided, initialize the items with a group
if (!props.items.length && !props.noInitialization) {
  items.value = queryBuilderInitializeItems()
}

// Dispose of store on unmount
onUnmounted(() => {
  store.$dispose()
  const pinia = getActivePinia()
  delete pinia?.state.value[store.$id]
})

defineExpose({
  clearFilter,
  getModifiedColumnFilters,
  getModifiedColumnFilter,
})
</script>

<template>
  <div
    ref="queryBuilderEl"
    class="query-builder"
    :class="{ 'is-collapsed': isSmallerScreen }"
  >
    <template v-if="showColumnFilters && hasColumnFilters">
      <!-- Column filters -->
      <div
        text="sm"
        font="bold"
        p="x-3 t-2"
      >
        {{ $t('table.columnFilters') }}
      </div>

      <QueryBuilderRow
        v-for="item in columnFilters"
        :key="item.path"
        :item
        :level
        :editable
        no-add
        no-condition-change
        :remove-fnc="removeColumnFilter"
        p="!l-2"
        m="!l-0"
      />

      <Separator m="t-2 b-4" />
    </template>

    <QueryBuilderRow
      v-for="item in items"
      :key="item.path"
      :item
      :level
      :editable
      p="!l-2"
      m="!l-0"
    />

    <!-- Drop indicator -->
    <div
      v-if="draggedItem?.dropIndicatorPos"
      class="drop-indicator"
      :style="{
        left: `${draggedItem.dropIndicatorPos.x ?? 0}px`,
        top: `${draggedItem.dropIndicatorPos.y ?? 0}px`,
        width: `${draggedItem.dropIndicatorPos.width ?? 0}px`,
      }"
    >
      <div
        class="drop-indicator__icon"
        :class="{
          'rotate-y-180 -top-3': draggedItem.dropDirection === 'below',
          'rotate-180 -top-7px': draggedItem.dropDirection === 'above',
        }"
      >
        <div i-tabler:arrow-back />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.query-builder {
  @apply relative bg-ca p-1 p-y-2 rounded-custom overflow-auto;
}

.drop-indicator {
  @apply absolute h-2px bg-primary w-full rounded-full pointer-events-none z-$zMax;

  &__icon {
    @apply w-5 h-5 relative -left-5 rounded-custom
    color-primary bg-white dark:bg-darker;
  }
}
</style>
