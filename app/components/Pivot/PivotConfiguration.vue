<script setup lang="ts" generic="T extends IItem = IItem">
import Sortable from 'sortablejs'
import type { SortableEvent } from 'sortablejs'
import { SummaryEnum } from '#layers/utilities/shared/enums/summary.enum'

// Models
import { PivotItem } from './models/pivot-item.model'
import type { IPivotValueUsageSlot } from './models/pivot-item.model'

// Functions
import {
  getPivotFilterItems,
  getPivotItemsByMultiUsage,
  getPivotItemsBySingleUsage,
  syncPivotMultiUsageIndices,
  syncPivotSingleUsageIndices,
} from './functions/pivot-item-usage'

// Store
import { usePivotStore } from './stores/pivot.store'

type IProps = {
  isOpen?: boolean
}

type IEmits = {
  submit: []
}

type IPivotConfigRole = 'row' | 'column' | 'filter' | 'value'

type IValueEntry = {
  item: PivotItem<T>
  slot: IPivotValueUsageSlot<T>
  key: string
}

const props = defineProps<IProps>()
const emit = defineEmits<IEmits>()

const SORTABLE_GROUP = 'pivot-configuration'

const SORTABLE_FILTER = '.pivot-configuration__no-drag'

const SUMMARY_OPTIONS = [
  SummaryEnum.SUM,
  SummaryEnum.COUNT,
  SummaryEnum.AVERAGE,
  SummaryEnum.MEDIAN,
] as const

const { items } = usePivotStore<T>()

const allFieldsEl = useTemplateRef('allFieldsEl')
const rowFieldsEl = useTemplateRef('rowFieldsEl')
const columnFieldsEl = useTemplateRef('columnFieldsEl')
const filterFieldsEl = useTemplateRef('filterFieldsEl')
const dataFieldsEl = useTemplateRef('dataFieldsEl')

const draftItems = ref([]) as Ref<PivotItem<T>[]>

const draftRows = computed(() => getPivotItemsBySingleUsage(draftItems.value, 'row'))
const draftColumns = computed(() => getPivotItemsBySingleUsage(draftItems.value, 'column'))
const draftValues = computed(() => getPivotItemsByMultiUsage(draftItems.value, 'value'))
const draftFilters = computed(() => getPivotFilterItems(draftItems.value))

let valueSlotKeys = new WeakMap<IPivotValueUsageSlot<T>, string>()
let valueSlotKeyIndex = 0
let sortableInstances: Sortable[] = []

const draftValueEntries = computed<IValueEntry[]>(() => {
  const entries: IValueEntry[] = []

  for (const item of draftItems.value) {
    for (const slot of item.usage.value ?? []) {
      entries.push({
        item,
        slot,
        key: getValueSlotKey(slot),
      })
    }
  }

  return entries.toSorted((a, b) => a.slot.index - b.slot.index)
})

const sortableOptions = {
  animation: 150,
  draggable: '.pivot-configuration__item',
  ghostClass: 'opacity-50',
  filter: SORTABLE_FILTER,
  preventOnFilter: true,
} satisfies Partial<Sortable.Options>

function cloneItemUsage(usage: PivotItem<T>['usage']) {
  const clone: PivotItem<T>['usage'] = {}

  if (usage.row) {
    clone.row = { ...usage.row }
  }

  if (usage.column) {
    clone.column = { ...usage.column }
  }

  if (usage.value) {
    clone.value = usage.value.map(slot => ({ ...slot }))
  }

  if (usage.filter) {
    clone.filter = usage.filter.map(slot => ({ ...slot }))
  }

  return clone
}

function clonePivotItem(item: PivotItem<T>) {
  const clone = new PivotItem<T>({
    field: item.field,
    label: item.label,
    dataType: item.dataType,
    minWidth: item.minWidth,
    resizable: item.resizable,
    usage: cloneItemUsage(item.usage),
    width: item.width,
  })

  clone.widthResolved = item.widthResolved
  clone._width = item._width

  return clone
}

function resetDraftItems() {
  valueSlotKeys = new WeakMap()
  valueSlotKeyIndex = 0
  draftItems.value = items.value.map(clonePivotItem)
  normalizeDraftUsage()
}

function getValueSlotKey(slot: IPivotValueUsageSlot<T>) {
  const existingKey = valueSlotKeys.get(slot)

  if (existingKey) {
    return existingKey
  }

  const key = `value-${valueSlotKeyIndex++}`

  valueSlotKeys.set(slot, key)

  return key
}

function isItemUsed(item: PivotItem<T>) {
  return !!(
    item.usage.row
    || item.usage.column
    || item.usage.value?.length
    || item.usage.filter !== undefined
  )
}

function clearItemUsage(item: PivotItem<T>) {
  delete item.usage.row
  delete item.usage.column
  delete item.usage.value
  delete item.usage.filter
}

function getItemFromEl(el: HTMLElement) {
  const field = el.dataset.field

  if (!field) {
    return undefined
  }

  return draftItems.value.find(item => String(item.field) === field)
}

function getFieldOrderFromContainer(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>('.pivot-configuration__item')]
    .map(el => getItemFromEl(el))
    .filter((item): item is PivotItem<T> => !!item)
}

function getValueOrderFromContainer(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>('.pivot-configuration__item')]
    .map(el => {
      const valueKey = el.dataset.valueKey

      if (valueKey) {
        return draftValueEntries.value.find(entry => entry.key === valueKey)?.item
      }

      return getItemFromEl(el)
    })
    .filter((item): item is PivotItem<T> => !!item)
}

function uniqueItems(ordered: PivotItem<T>[]) {
  return ordered.filter((item, index) => ordered.indexOf(item) === index)
}

function insertItemAt(ordered: PivotItem<T>[], item: PivotItem<T>, index: number) {
  const nextOrdered = ordered.filter(current => current !== item)
  const nextIndex = Math.max(0, Math.min(index, nextOrdered.length))

  nextOrdered.splice(nextIndex, 0, item)

  return nextOrdered
}

function setRoleOrder(role: IPivotConfigRole, ordered: PivotItem<T>[]) {
  switch (role) {
    case 'row':
      syncPivotSingleUsageIndices({ items: draftItems, ordered: uniqueItems(ordered), role: 'row' })
      break
    case 'column':
      syncPivotSingleUsageIndices({ items: draftItems, ordered: uniqueItems(ordered), role: 'column' })
      break
    case 'filter':
      syncPivotMultiUsageIndices({ items: draftItems, ordered: uniqueItems(ordered), role: 'filter' })
      break
    case 'value':
      syncPivotMultiUsageIndices({ items: draftItems, ordered, role: 'value' })
      break
  }
}

function normalizeDraftUsage() {
  setRoleOrder('row', draftRows.value)
  setRoleOrder('column', draftColumns.value)
  setRoleOrder('filter', draftFilters.value)
  setRoleOrder('value', draftValues.value)
}

function moveItemToRole(
  item: PivotItem<T>,
  role: IPivotConfigRole,
  index: number,
  targetOrder?: PivotItem<T>[],
) {
  const nextRows = draftRows.value.filter(row => row !== item)
  const nextColumns = draftColumns.value.filter(column => column !== item)
  const nextFilters = draftFilters.value.filter(filter => filter !== item)
  const nextValues = draftValues.value.filter(value => value !== item)
  const orderedTarget = targetOrder
    ? uniqueItems(targetOrder)
    : undefined

  clearItemUsage(item)

  switch (role) {
    case 'row':
      setRoleOrder('row', orderedTarget ?? insertItemAt(nextRows, item, index))
      setRoleOrder('column', nextColumns)
      setRoleOrder('filter', nextFilters)
      setRoleOrder('value', nextValues)
      break
    case 'column':
      setRoleOrder('row', nextRows)
      setRoleOrder('column', orderedTarget ?? insertItemAt(nextColumns, item, index))
      setRoleOrder('filter', nextFilters)
      setRoleOrder('value', nextValues)
      break
    case 'filter':
      item.usage.filter = []
      setRoleOrder('row', nextRows)
      setRoleOrder('column', nextColumns)
      setRoleOrder('filter', orderedTarget ?? insertItemAt(nextFilters, item, index))
      setRoleOrder('value', nextValues)
      break
    case 'value':
      item.usage.value = [{ index: 0, summaryType: SummaryEnum.SUM }]
      setRoleOrder('row', nextRows)
      setRoleOrder('column', nextColumns)
      setRoleOrder('filter', nextFilters)
      setRoleOrder('value', orderedTarget ?? insertItemAt(nextValues, item, index))
      break
  }

  normalizeDraftUsage()
}

function removeItemFromRole(item: PivotItem<T>, role: IPivotConfigRole) {
  switch (role) {
    case 'row':
      setRoleOrder('row', draftRows.value.filter(row => row !== item))
      break
    case 'column':
      setRoleOrder('column', draftColumns.value.filter(column => column !== item))
      break
    case 'filter':
      setRoleOrder('filter', draftFilters.value.filter(filter => filter !== item))
      break
    case 'value':
      setRoleOrder('value', draftValues.value.filter(value => value !== item))
      break
  }

  normalizeDraftUsage()
}

function removeValueEntry(entry: IValueEntry) {
  const ordered = draftValueEntries.value
    .filter(current => current.key !== entry.key)
    .map(current => current.item)

  setRoleOrder('value', ordered)
  normalizeDraftUsage()
}

function toggleItem(item: PivotItem<T>) {
  if (isItemUsed(item)) {
    setRoleOrder('row', draftRows.value.filter(row => row !== item))
    setRoleOrder('column', draftColumns.value.filter(column => column !== item))
    setRoleOrder('filter', draftFilters.value.filter(filter => filter !== item))
    setRoleOrder('value', draftValues.value.filter(value => value !== item))
    clearItemUsage(item)
    normalizeDraftUsage()
    return
  }

  moveItemToRole(item, 'row', draftRows.value.length)
}

function handleSortableAdd(role: IPivotConfigRole, evt: SortableEvent) {
  const item = getItemFromEl(evt.item)

  if (!item) {
    evt.item.remove()
    return
  }

  const container = evt.to as HTMLElement
  const ordered = role === 'value'
    ? getValueOrderFromContainer(container)
    : getFieldOrderFromContainer(container)

  moveItemToRole(item, role, evt.newIndex ?? 0, ordered)
  evt.item.remove()
}

function handleSortableUpdate(role: IPivotConfigRole, evt: SortableEvent) {
  const container = evt.to as HTMLElement
  const ordered = role === 'value'
    ? getValueOrderFromContainer(container)
    : getFieldOrderFromContainer(container)

  setRoleOrder(role, ordered)
  normalizeDraftUsage()
}

function handleSummaryTypeChange(entry: IValueEntry, summaryType: SummaryEnum) {
  entry.slot.summaryType = summaryType

  $hide()
}

function getSummaryType(entry: IValueEntry) {
  return entry.slot.summaryType ?? SummaryEnum.SUM
}

function handleSubmit() {
  normalizeDraftUsage()

  const draftItemsByField = new Map(
    draftItems.value.map(item => [String(item.field), item]),
  )

  for (const item of items.value) {
    const draftItem = draftItemsByField.get(String(item.field))

    if (!draftItem) {
      continue
    }

    item.usage = cloneItemUsage(draftItem.usage)
  }

  items.value = [...items.value]
  emit('submit')
}

function createSortable(
  el: HTMLElement | null | undefined,
  options: Sortable.Options,
) {
  if (!el) {
    return undefined
  }

  return Sortable.create(el, options)
}

function initSortables() {
  destroySortables()

  sortableInstances = [
    createSortable(allFieldsEl.value, {
      ...sortableOptions,
      group: {
        name: SORTABLE_GROUP,
        pull: 'clone',
        put: false,
      },
      sort: false,
    }),
    createSortable(rowFieldsEl.value, {
      ...sortableOptions,
      group: SORTABLE_GROUP,
      onAdd: evt => handleSortableAdd('row', evt),
      onUpdate: evt => handleSortableUpdate('row', evt),
    }),
    createSortable(columnFieldsEl.value, {
      ...sortableOptions,
      group: SORTABLE_GROUP,
      onAdd: evt => handleSortableAdd('column', evt),
      onUpdate: evt => handleSortableUpdate('column', evt),
    }),
    createSortable(filterFieldsEl.value, {
      ...sortableOptions,
      group: SORTABLE_GROUP,
      onAdd: evt => handleSortableAdd('filter', evt),
      onUpdate: evt => handleSortableUpdate('filter', evt),
    }),
    createSortable(dataFieldsEl.value, {
      ...sortableOptions,
      group: SORTABLE_GROUP,
      onAdd: evt => handleSortableAdd('value', evt),
      onUpdate: evt => handleSortableUpdate('value', evt),
    }),
  ].filter((instance): instance is Sortable => !!instance)
}

function destroySortables() {
  sortableInstances.forEach(instance => instance.destroy())
  sortableInstances = []
}

watch(() => props.isOpen, async isOpen => {
  if (!isOpen) {
    return
  }

  resetDraftItems()
  await nextTick()
  initSortables()
})

onMounted(() => {
  resetDraftItems()
  initSortables()
})

onBeforeUnmount(() => {
  destroySortables()
})
</script>

<template>
  <Form
    :label="$t('general.apply')"
    :icon="false"
    :ui="{
      contentClass: () => 'flex flex-col gap-2 grow',
      controlsClass: () => 'sticky flex items-center shrink-0 gap-2 bottom-0 z-1 rounded-b-custom',
    }"
    :submit-btn-props="{ size: 'sm', noUppercase: true }"
    @submit="handleSubmit"
  >
    <div class="flex-1 grid grid-cols-2 gap-3">
      <!-- Left column -->
      <div class="flex flex-col gap-3">
        <!-- All fields -->
        <section>
          <header class="section-header">
            <div class="i-material-symbols:apps w-4 h-4" />
            <span>{{ $t('pivot.allFields') }}</span>
          </header>

          <div
            ref="allFieldsEl"
            class="section-content"
          >
            <div
              v-for="item in draftItems"
              :key="String(item.field)"
              class="pivot-configuration__item p-y-0!"
              :data-field="String(item.field)"
            >
              <Checkbox
                :model-value="isItemUsed(item)"
                :check-value="true"
                :uncheck-value="false"
                size="sm"
                no-hover-effect
                class="pivot-configuration__no-drag shrink-0"
                @update:model-value="toggleItem(item)"
              />

              <span class="grow truncate font-rem-12">
                {{ item._label }}
              </span>
            </div>
          </div>
        </section>

        <!-- Filter fields -->
        <section>
          <header class="section-header">
            <div class="i-ic:round-filter-alt w-4 h-4" />
            <span>{{ $t('pivot.filterFields') }}</span>
          </header>

          <div
            ref="filterFieldsEl"
            class="section-content"
          >
            <div
              v-for="item in draftFilters"
              :key="`filter-${String(item.field)}`"
              class="pivot-configuration__item flex items-center gap-2 min-h-7 p-2 rounded-custom bg-white dark:bg-dark-950 cursor-grab"
              :data-field="String(item.field)"
            >
              <span class="grow truncate font-rem-12">
                {{ item._label }}
              </span>

              <Btn
                preset="TRASH"
                size="auto"
                tabindex="-1"
                class="pivot-configuration__no-drag"
                @click="removeItemFromRole(item, 'filter')"
              />
            </div>
          </div>
        </section>
      </div>

      <!-- Right column -->
      <div class="flex flex-col gap-3 min-h-0 h-full">
        <!-- Row fields -->
        <section>
          <header class="section-header">
            <div class="i-material-symbols:view-list w-4 h-4" />
            <span>{{ $t('pivot.rowFields') }}</span>
          </header>

          <div
            ref="rowFieldsEl"
            class="section-content"
          >
            <div
              v-for="item in draftRows"
              :key="`row-${String(item.field)}`"
              class="pivot-configuration__item flex items-center gap-2 min-h-7 p-2 rounded-custom bg-white dark:bg-dark-950 cursor-grab"
              :data-field="String(item.field)"
            >
              <span class="grow truncate font-rem-12">
                {{ item._label }}
              </span>

              <Btn
                preset="TRASH"
                size="auto"
                tabindex="-1"
                class="pivot-configuration__no-drag"
                @click="removeItemFromRole(item, 'row')"
              />
            </div>
          </div>
        </section>

        <!-- Column fields -->
        <section>
          <header class="section-header">
            <div class="i-material-symbols:view-column w-4 h-4" />
            <span>{{ $t('pivot.columnFields') }}</span>
          </header>

          <div
            ref="columnFieldsEl"
            class="section-content"
          >
            <div
              v-for="item in draftColumns"
              :key="`column-${String(item.field)}`"
              class="pivot-configuration__item flex items-center gap-2 min-h-7 p-2 rounded-custom bg-white dark:bg-dark-950 cursor-grab"
              :data-field="String(item.field)"
            >
              <span class="grow truncate font-rem-12">
                {{ item._label }}
              </span>

              <Btn
                preset="TRASH"
                size="auto"
                tabindex="-1"
                class="pivot-configuration__no-drag"
                @click="removeItemFromRole(item, 'column')"
              />
            </div>
          </div>
        </section>

        <!-- Data fields -->
        <section>
          <header class="section-header">
            <div class="i-material-symbols:functions w-4 h-4" />
            <span>{{ $t('pivot.dataFields') }}</span>
          </header>

          <div
            ref="dataFieldsEl"
            class="section-content"
          >
            <div
              v-for="entry in draftValueEntries"
              :key="entry.key"
              class="pivot-configuration__item flex items-center gap-1 min-h-7 p-2 rounded-custom bg-white dark:bg-dark-950 cursor-grab"
              :data-field="String(entry.item.field)"
              :data-value-key="entry.key"
            >
              <span class="grow truncate font-rem-12">
                {{ entry.item._label }}
              </span>

              <Btn
                size="auto"
                no-uppercase
                no-hover-effect
                :ripple="false"
                class="shrink-0 p-y-1.5px! pivot-configuration__no-drag"
                :label="$t(`summary.${getSummaryType(entry)}`)"
                :ui="{
                  labelClass: ({ defaults }) => `font-rem-11 p-x-2`,
                }"
              >
                <Menu
                  w="36"
                  h="!auto"
                  dense
                  no-uplift
                  placement="left-start"
                >
                  <div class="flex flex-col gap-0.5 p-1">
                    <Btn
                      v-for="summaryType in SUMMARY_OPTIONS"
                      :key="summaryType"
                      size="sm"
                      no-uppercase
                      w="full"
                      class="pivot-configuration__no-drag"
                      :label="$t(`summary.${summaryType}`)"
                      :color="getSummaryType(entry) === summaryType ? 'primary' : 'ca'"
                      @click="handleSummaryTypeChange(entry, summaryType)"
                    />
                  </div>
                </Menu>
              </Btn>

              <Btn
                preset="TRASH"
                size="auto"
                tabindex="-1"
                class="pivot-configuration__no-drag"
                @click="removeValueEntry(entry)"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  </Form>
</template>

<style scoped lang="scss">
section {
  @apply flex grow flex-col gap-1 shrink-0;

  .section-header {
    @apply flex shrink-0 items-center gap-1.5 font-rem-11 font-bold uppercase tracking-wide color-ca p-l-1;
  }

  .section-content {
    @apply flex grow flex-col gap-1 overflow-auto p-1 rounded-custom overflow-x-hidden
    bg-slate-100 dark:bg-dark-900;
  }
}

.pivot-configuration__item {
  @apply flex items-center gap-2 p-2 rounded-custom cursor-grab;
}
</style>
