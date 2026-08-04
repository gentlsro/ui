<script setup lang="ts" generic="T extends IItem = IItem">
import Sortable from 'sortablejs'
import type { SortableEvent } from 'sortablejs'

// Models
import { PivotItem } from './models/pivot-item.model'

// Functions
import {
  getPivotFilterItems,
  getPivotItemsByMultiUsage,
  getPivotItemsBySingleUsage,
} from './functions/pivot-item-usage'
import {
  normalizePivotMeasureIds,
} from './functions/pivot-measure-id'
import {
  addPivotConfigurationRole,
  getPivotConfigurationValueEntries,
  isPivotConfigurationItemUsed,
  movePivotConfigurationEntry,
  normalizePivotConfigurationUsage,
  removePivotConfigurationRole,
  setPivotConfigurationRoleOrder,
  setPivotConfigurationValueOrder,
  togglePivotConfigurationItem,
} from './functions/pivot-configuration-draft'
import type {
  IPivotConfigurationRole,
  IPivotConfigurationValueEntry,
} from './functions/pivot-configuration-draft'

// Store
import { usePivotStore } from './stores/pivot.store'

type IProps = {
  isOpen?: boolean
}

type IEmits = {
  submit: []
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

const {
  items,
  config,
  applyConfiguration,
  cancelTransform,
  transformError,
} = usePivotStore<T>()

const allFieldsEl = useTemplateRef('allFieldsEl')
const rowFieldsEl = useTemplateRef('rowFieldsEl')
const columnFieldsEl = useTemplateRef('columnFieldsEl')
const filterFieldsEl = useTemplateRef('filterFieldsEl')
const dataFieldsEl = useTemplateRef('dataFieldsEl')

const draftItems = ref([]) as Ref<PivotItem<T>[]>
const draftValuesOnRows = ref(false)

const draftRows = computed(() => getPivotItemsBySingleUsage(draftItems.value, 'row'))
const draftColumns = computed(() => getPivotItemsBySingleUsage(draftItems.value, 'column'))
const draftValues = computed(() => getPivotItemsByMultiUsage(draftItems.value, 'value'))
const draftFilters = computed(() => getPivotFilterItems(draftItems.value))

let sortableInstances: Sortable[] = []

const draftValueEntries = computed(() => getPivotConfigurationValueEntries(draftItems.value))

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
  draftItems.value = items.value.map(clonePivotItem)
  normalizePivotMeasureIds(draftItems.value)
  draftValuesOnRows.value = !!config.value?.valuesOnRows
  normalizeDraftUsage()
}

function getItemFromEl(el: HTMLElement) {
  const field = el.dataset.field

  if (!field) {
    return undefined
  }

  return draftItems.value.find(item => String(item.field) === field)
}

function setRoleOrder(role: IPivotConfigurationRole, ordered: PivotItem<T>[]) {
  setPivotConfigurationRoleOrder(draftItems.value, role, ordered)
}

function normalizeDraftUsage() {
  normalizePivotConfigurationUsage(draftItems.value)
}

function addItemToRole(
  item: PivotItem<T>,
  role: IPivotConfigurationRole,
  index: number,
) {
  addPivotConfigurationRole({ items: draftItems.value, item, role, index })
}

function removeItemFromRole(item: PivotItem<T>, role: IPivotConfigurationRole) {
  removePivotConfigurationRole({ items: draftItems.value, item, role })
}

function removeValueEntry(entry: IPivotConfigurationValueEntry<T>) {
  removePivotConfigurationRole({
    items: draftItems.value,
    item: entry.item,
    role: 'value',
    measureId: entry.id,
  })
}

function removeRoleEntry(
  item: PivotItem<T>,
  role: IPivotConfigurationRole,
  measureId?: string,
) {
  removePivotConfigurationRole({ items: draftItems.value, item, role, measureId })
}

function toggleItem(item: PivotItem<T>) {
  togglePivotConfigurationItem({ items: draftItems.value, item })
}

function handleSortableAdd(role: IPivotConfigurationRole, evt: SortableEvent) {
  const item = getItemFromEl(evt.item)

  if (!item) {
    evt.item.remove()

    return
  }

  const sourceRole = (evt.from as HTMLElement).dataset.role as IPivotConfigurationRole | 'all' | undefined
  const measureId = evt.item.dataset.measureId
  const index = evt.newDraggableIndex ?? evt.newIndex ?? 0

  evt.item.remove()

  if (sourceRole && sourceRole !== 'all' && sourceRole !== role) {
    removeRoleEntry(item, sourceRole, measureId)
  }

  addItemToRole(item, role, index)
}

function handleSortableUpdate(role: IPivotConfigurationRole, evt: SortableEvent) {
  const from = evt.oldDraggableIndex ?? evt.oldIndex ?? 0
  const to = evt.newDraggableIndex ?? evt.newIndex ?? 0

  if (role === 'value') {
    setPivotConfigurationValueOrder(
      draftItems.value,
      movePivotConfigurationEntry(draftValueEntries.value, from, to),
    )
  } else {
    const entries = role === 'row'
      ? draftRows.value
      : role === 'column'
        ? draftColumns.value
        : draftFilters.value

    setRoleOrder(role, movePivotConfigurationEntry(entries, from, to))
  }

  normalizeDraftUsage()
}

function handleEntryKeydown(
  event: KeyboardEvent,
  role: IPivotConfigurationRole,
  item: PivotItem<T>,
  measureId?: string,
) {
  if (!event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) {
    return
  }

  event.preventDefault()

  const direction = event.key === 'ArrowUp' ? -1 : 1

  if (role === 'value') {
    const entries = draftValueEntries.value
    const currentIndex = entries.findIndex(entry => entry.id === measureId)
    const targetIndex = Math.max(0, Math.min(currentIndex + direction, entries.length - 1))

    setPivotConfigurationValueOrder(
      draftItems.value,
      movePivotConfigurationEntry(entries, currentIndex, targetIndex),
    )

    return
  }

  const entries = role === 'row'
    ? draftRows.value
    : role === 'column'
      ? draftColumns.value
      : draftFilters.value
  const currentIndex = entries.indexOf(item)
  const targetIndex = Math.max(0, Math.min(currentIndex + direction, entries.length - 1))

  setRoleOrder(role, movePivotConfigurationEntry(entries, currentIndex, targetIndex))
}

function handleSummaryTypeChange(
  entry: IPivotConfigurationValueEntry<T>,
  summaryType: SummaryEnum,
) {
  entry.slot.summaryType = summaryType

  $hide()
}

function getSummaryType(entry: IPivotConfigurationValueEntry<T>) {
  return entry.slot.summaryType ?? SummaryEnum.SUM
}

async function handleSubmit() {
  normalizeDraftUsage()

  const draftItemsByField = new Map(
    draftItems.value.map(item => [String(item.field), item]),
  )
  const nextItems = items.value.map(clonePivotItem)

  for (const item of nextItems) {
    const draftItem = draftItemsByField.get(String(item.field))

    if (!draftItem) {
      continue
    }

    item.usage = cloneItemUsage(draftItem.usage)
  }

  const applied = await applyConfiguration({
    items: nextItems,
    config: {
      ...config.value,
      valuesOnRows: draftValuesOnRows.value,
    },
  })

  if (applied) {
    emit('submit')
  }
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
    cancelTransform()

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
  cancelTransform()
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
    <Banner
      v-if="transformError"
      variant="error"
      outlined
      :label="transformError.message"
    />

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
            data-role="all"
          >
            <div
              v-for="item in draftItems"
              :key="String(item.field)"
              class="pivot-configuration__item p-y-0!"
              :data-field="String(item.field)"
            >
              <Checkbox
                :model-value="isPivotConfigurationItemUsed(item)"
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
            data-role="filter"
          >
            <div
              v-for="item in draftFilters"
              :key="`filter-${String(item.field)}`"
              class="pivot-configuration__item flex items-center gap-2 min-h-7 p-2 rounded-custom bg-white dark:bg-dark-950 cursor-grab"
              :data-field="String(item.field)"
              data-role="filter"
              tabindex="0"
              @keydown="handleEntryKeydown($event, 'filter', item)"
            >
              <span class="grow truncate font-rem-12">
                {{ item._label }}
              </span>

              <Btn
                preset="TRASH"
                size="auto"
                :aria-label="$t('pivot.removeField', { field: item._label })"
                class="pivot-configuration__no-drag"
                @click="removeItemFromRole(item, 'filter')"
              />
            </div>
          </div>
        </section>
      </div>

      <!-- Right column -->
      <div class="flex flex-col gap-3 min-h-0 h-full">
        <!-- Layout -->
        <div class="flex flex-col gap-2">
          <header class="section-header">
            <div class="i-material-symbols:view-agenda w-4 h-4" />
            <span>{{ $t('pivot.layout') }}</span>
          </header>

          <div class="p-1 rounded-custom bg-slate-100 dark:bg-dark-900">
            <Checkbox
              v-model="draftValuesOnRows"
              size="sm"
              no-hover-effect
              class="pivot-configuration__no-drag"
              :label="$t('pivot.valuesOnRows')"
              :disabled="draftValues.length < 2"
            />
          </div>
        </div>

        <!-- Row fields -->
        <section>
          <header class="section-header">
            <div class="i-material-symbols:view-list w-4 h-4" />
            <span>{{ $t('pivot.rowFields') }}</span>
          </header>

          <div
            ref="rowFieldsEl"
            class="section-content"
            data-role="row"
          >
            <div
              v-for="item in draftRows"
              :key="`row-${String(item.field)}`"
              class="pivot-configuration__item flex items-center gap-2 min-h-7 p-2 rounded-custom bg-white dark:bg-dark-950 cursor-grab"
              :data-field="String(item.field)"
              data-role="row"
              tabindex="0"
              @keydown="handleEntryKeydown($event, 'row', item)"
            >
              <span class="grow truncate font-rem-12">
                {{ item._label }}
              </span>

              <Btn
                preset="TRASH"
                size="auto"
                :aria-label="$t('pivot.removeField', { field: item._label })"
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
            data-role="column"
          >
            <div
              v-for="item in draftColumns"
              :key="`column-${String(item.field)}`"
              class="pivot-configuration__item flex items-center gap-2 min-h-7 p-2 rounded-custom bg-white dark:bg-dark-950 cursor-grab"
              :data-field="String(item.field)"
              data-role="column"
              tabindex="0"
              @keydown="handleEntryKeydown($event, 'column', item)"
            >
              <span class="grow truncate font-rem-12">
                {{ item._label }}
              </span>

              <Btn
                preset="TRASH"
                size="auto"
                :aria-label="$t('pivot.removeField', { field: item._label })"
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
            data-role="value"
          >
            <div
              v-for="entry in draftValueEntries"
              :key="entry.id"
              class="pivot-configuration__item flex items-center gap-1 min-h-7 p-2 rounded-custom bg-white dark:bg-dark-950 cursor-grab"
              :data-field="String(entry.item.field)"
              :data-measure-id="entry.id"
              data-role="value"
              tabindex="0"
              @keydown="handleEntryKeydown($event, 'value', entry.item, entry.id)"
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
                :aria-label="$t('pivot.removeMeasure', { field: entry.item._label })"
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

  .section-content {
    @apply flex grow flex-col gap-1 overflow-auto p-1 rounded-custom overflow-x-hidden
    bg-slate-100 dark:bg-dark-900;
  }
}

.section-header {
  @apply flex shrink-0 items-center gap-1.5 font-rem-11 font-bold uppercase tracking-wide color-ca p-l-1;
}

.pivot-configuration__item {
  @apply flex items-center gap-2 p-2 rounded-custom cursor-grab;
}
</style>
