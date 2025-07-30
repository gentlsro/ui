<script setup lang="ts">
import { getActivePinia } from 'pinia'
import type { ComparatorEnum } from '$comparatorEnum'

// Types
import type { IQueryBuilderProps } from './types/query-builder-props.type'
import type { IQueryBuilderGroup } from './types/query-builder-group-props.type'
import type { IQueryBuilderEmits } from './types/query-builder-emits.type'

// Functions
import { getComponentProps } from '../../functions/get-component-props'
import { queryBuilderInitializeItems } from './functions/query-builder-initialize-items'

// Store
import { queryBuilderIdKey, useQueryBuilderStore } from './query-builder.store'
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

defineEmits<IQueryBuilderEmits>()

const uuid = injectLocal(queryBuilderIdKey, useId())

provideLocal(queryBuilderIdKey, uuid)

// Store
const store = useQueryBuilderStore({ queryBuilderProps: props })
const {
  allowNegation: storeAllowNegation,
  queryBuilderEl,
  columns: storeColumns,
  items: storeItems,
  maxNestingLevel: storeMaxNestingLevel,
  getFilterComponentFnc: storeGetFilterComponentFnc,
} = storeToRefs(store)

// Layout
const items = defineModel<IQueryBuilderProps['items']>('items', { required: true })
const level = 0
const noItemOverlay = toRef(props, 'noItemOverlay')

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

  nextTick(() => {
    const addedEl = unrefElement(queryBuilderEl)?.querySelector(
      `[data-path="${path}"]`,
    ) as HTMLElement

    setTimeout(() => {
      addedEl?.click()
    }, 150)
  })
}

// Column filters
const {
  columnFilters,
  hasColumnFilters,
  modifyColumnFilter,
  removeColumnFilter,
  getModifiedColumnFilters,
  getModifiedColumnFilter,
} = useQueryBuilderColumnFilters(props)

// Init
const columns = toRef(props, 'columns')
const maxNestingLevel = toRef(props, 'maxLevel')
const allowNegation = toRef(props, 'allowNegation')

syncRef(columns, storeColumns, { direction: 'ltr' })
syncRef(items, storeItems, { direction: 'both' })
syncRef(maxNestingLevel, storeMaxNestingLevel, { direction: 'ltr' })
syncRef(allowNegation, storeAllowNegation, { direction: 'ltr' })
syncRef(toRef(props, 'getFilterComponent'), storeGetFilterComponentFnc, { direction: 'ltr' })

// Lifecycle
// When no items are provided, initialize the items with a group
if (!props.items.length && !props.noInitialization) {
  storeItems.value = queryBuilderInitializeItems()
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
        v-if="storeItems.length"
        vertical
        m="r-2 l-1"
        border="!dark:truegray-500 !primary !r-2px"
      />
    </template>

    <QueryBuilderRowInline
      v-for="item in storeItems"
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
      m="l-2"
      color="dark:white"
      border="2 primary"
      :label="$t('queryBuilder.addFirstCondition')"
      @click="handleAddFirstCondition"
    />
  </div>
</template>

<style scoped lang="scss">
.query-builder-inline {
  @apply flex items-center flex-wrap gap-y-0.5 gap-x-1 p-y-1;
}
</style>
