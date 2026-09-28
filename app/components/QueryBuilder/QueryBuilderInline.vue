<script setup lang="ts" vapor>
import type { ComparatorEnum } from '$comparatorEnum'

// Types
import type { IQueryBuilderProps } from './types/query-builder-props.type'
import type { IQueryBuilderGroup } from './types/query-builder-group-props.type'
import type { IQueryBuilderEmits } from './types/query-builder-emits.type'

// Functions
import { queryBuilderInitializeItems } from './functions/query-builder-initialize-items'

// Store
import { QUERY_BUILDER_ID_KEY, useQueryBuilderStore } from './query-builder.store'
import { useQueryBuilderColumnFilters } from './functions/useQueryBuilderColumnFilters'

const props = withDefaults(defineProps<IQueryBuilderProps & {
  /**
   * When true, the `QueryBuilderInlineItem` will not use overlay
   * for the edit menu
   */
  noItemOverlay?: boolean
}>(), {
  ...getComponentProps('queryBuilder'),
})

const emits = defineEmits<IQueryBuilderEmits>()

// Init
const uuid = generateUUID()
provideLocal(QUERY_BUILDER_ID_KEY, uuid)

// Store
const {
  queryBuilderEl,
  items: storeItems,
  columns: storeColumns,
  getFilterComponentFnc: storeGetFilterComponentFnc,
} = useQueryBuilderStore({ queryBuilderProps: props })

// Layout
const level = 0
const noItemOverlay = toRef(props, 'noItemOverlay')
const items = defineModel<IQueryBuilderRow[]>('items', { required: true })

provide('noItemOverlay', noItemOverlay)

const noChildren = computed(() => {
  return !(storeItems.value[0] as IQueryBuilderGroup)?.children.length
})

function clearFilter() {
  storeItems.value = [
    {
      id: generateUUID(),
      isGroup: true,
      children: [],
      condition: 'AND',
      path: '0',
    },
  ]
}

let openItemTimer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(openItemTimer))

function handleAddFirstCondition() {
  const firstGroup = storeItems.value[0] as IQueryBuilderGroup

  const path = `${firstGroup.path}.children.0`
  const firstColumn = toValue(columns)[0]

  firstGroup.children = [
    {
      id: generateUUID(),
      field: firstColumn?.field as string,
      filterField: firstColumn?.filterField as string,
      comparator: firstColumn?.comparator as ComparatorEnum,
      value: undefined as unknown as string,
      path,
    },
  ]

  clearTimeout(openItemTimer)
  openItemTimer = setTimeout(() => {
    const addedEl = queryBuilderEl.value?.querySelector<HTMLElement>(`[data-path="${path}"]`)
    if (addedEl?.isConnected) {
      addedEl.click()
    }
  }, 150)
}

// Column filters
const {
  columnFilters,
  hasColumnFilters,
  modifyColumnFilter,
  removeColumnFilter,
  getModifiedColumnFilters,
  getModifiedColumnFilter,
} = useQueryBuilderColumnFilters(props, emits)

// Init
const columns = toRef(props, 'columns')

syncRef(items, storeItems, { direction: 'both', deep: true })
syncRefs(columns, storeColumns)
syncRefs(toRef(props, 'getFilterComponent'), storeGetFilterComponentFnc)

// Lifecycle
// When no items are provided, initialize the items with a group
if (!props.items.length && !props.noInitialization) {
  storeItems.value = queryBuilderInitializeItems()
}

defineExpose({
  clearFilter,
  getModifiedColumnFilters,
  getModifiedColumnFilter,
})
</script>

<template>
  <div
    ref="queryBuilderEl"
    class="query-builder-inline"
  >
    <!-- Column filters -->
    <template v-if="showColumnFilters && hasColumnFilters">
      <QueryBuilderRowInline
        v-for="item in columnFilters"
        :key="item.path"
        :item
        :level
        no-add
        no-condition-change
        :editable
        :remove-fnc="removeColumnFilter"
        :modify-fnc="modifyColumnFilter"
      />

      <Separator
        v-if="items.length"
        vertical
        m="x-1"
        border="!true-gray-200 !dark:true-gray-700 !r-1px"
      />
    </template>

    <QueryBuilderRowInline
      v-for="item in items"
      :key="item.id"
      :item
      :level
      :editable
    />

    <!-- Add first condition -->
    <Btn
      v-if="noChildren && editable"
      size="xs"
      preset="ADD"
      no-uppercase
      class="add-first-condition"
      :label="$t('queryBuilder.addFirstCondition')"
      @click="handleAddFirstCondition"
    />
  </div>
</template>

<style scoped lang="scss">
.query-builder-inline {
  @apply flex items-center flex-wrap gap-y-1 gap-x-1.5 p-y-1;
}

.add-first-condition {
  @apply min-h-7 rounded-lg border-1 border-dashed border-true-gray-300 dark:border-true-gray-600
    color-true-gray-500 dark:color-true-gray-400 font-medium;

  &:hover {
    @apply border-primary/60 color-primary dark:color-white bg-primary/5;
  }
}
</style>
