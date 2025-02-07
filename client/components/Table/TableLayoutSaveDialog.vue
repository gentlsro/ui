<script setup lang="ts">
// Types
import type { ITableLayout } from './types/table-layout.type'
import type { ITableSortItem } from './types/table-sort-item.type'

// Store
import { useTableStore } from './stores/table.store'
import { tableSaveLayout } from './functions/table-save-layout'
import { tableDeleteLayout } from './functions/table-delete-layout'
import { tableSerializeFilters } from './functions/table-serialize-filters'
import { tableSerializeSorting } from './functions/table-serialize-sorting'
import { tableSerializeSelect } from './functions/table-serialize-select'
import { tableExtractDataFromUrl } from './functions/table-extract-data-from-url'

type IProps = {
  layout?: ITableLayout
  modelValue?: boolean
}

const props = defineProps<IProps>()
const emits = defineEmits<{ (e: 'hide'): void }>()

// Utils
const { isLoading, handleRequest } = useRequest()

// Store
const {
  queryBuilder,
  internalColumns,
  modifiers,
  state,
  customData,
} = storeToRefs(useTableStore())

// Helpers
function getUnifiedSchema(schema: string | URLSearchParams) {
  const { filters, queryBuilder, sort, visibleColumns } = tableExtractDataFromUrl({
    columns: internalColumns.value,
    modifiers: modifiers.value,
    searchParams: schema,
  })

  const sortItems = sort.map(s => ({ ...s, direction: s.sort })) as ITableSortItem[]
  const filtersSerialized = serializeFilters(filters)
  const queryBuilderSerialized = serializeFilters(queryBuilder)
  const sortingSerialized = serializeSorting({ sortItems })
  const selectSerialized = serializeSelectedColumns({ select: visibleColumns })

  return {
    filters: filtersSerialized,
    queryBuilder: queryBuilderSerialized,
    sorting: sortingSerialized,
    select: selectSerialized,
  }
}

// Utils
const {
  saveLayout = tableSaveLayout,
  deleteLayout = tableDeleteLayout,
  serializeFilters = tableSerializeFilters,
  serializeSorting = tableSerializeSorting,
  serializeSelectedColumns = tableSerializeSelect,
} = modifiers.value ?? {}

// Layout
const model = defineModel<boolean>({ default: false })
const {
  model: layout,
  syncFromParent,
} = useRefReset<ITableLayout>(() => props.layout ?? {} as ITableLayout)

const toSave = ref({
  columns: false,
  filters: false,
  sorting: false,
  isPublic: false,
  isDefault: false,
})

const urlSchema = computed(() => {
  return getUnifiedSchema(useRequestURL().searchParams)
})

const canBeSaved = computed(() => {
  return (toSave.value.columns)
    || (toSave.value.filters && !!(urlSchema.value.filters || urlSchema.value.queryBuilder))
    || (toSave.value.sorting && !!urlSchema.value.sorting)
})

function loadLayout() {
  syncFromParent()

  const {
    filters,
    queryBuilder,
    sorting,
    select,
  } = getUnifiedSchema(props.layout?.schema ?? useRequestURL().searchParams)

  toSave.value = {
    columns: !!select,
    filters: !!filters || !!queryBuilder,
    sorting: !!sorting,
    isPublic: props.layout?.isPublic ?? false,
    isDefault: props.layout?.isDefault ?? false,
  }
}

function handleHide() {
  $z.value.$reset()
  emits('hide')
}

async function handleSave() {
  const isValid = await $z.value.$validate()

  if (!isValid) {
    return
  }

  const _toSave = Object.entries(toSave.value)
    .filter(([_, isSaved]) => isSaved)
    .map(([key]) => key as 'columns' | 'filters' | 'sorting')

  await saveLayout({
    layout: layout.value,
    internalColumns: internalColumns.value,
    toSave: _toSave,
    layouts: state.value.layouts,
    modifiers: modifiers.value,
    queryBuilder: queryBuilder.value,
    customData: customData.value,
    isPublic: toSave.value.isPublic,
    isDefault: toSave.value.isDefault,
    handleRequest,
  })

  $hide()
}

async function handleDelete() {
  await deleteLayout({
    layout: layout.value,
    layouts: state.value.layouts,
    customData: customData.value,
    handleRequest,
  })

  $hide()
}

// Validation
const $z = useZod(
  { layout: z.object({ name: z.string() }) },
  { layout },
  { scope: '_layoutSaveDialog' },
)
</script>

<template>
  <Dialog
    v-model="model"
    w="150"
    h="auto"
    manual
    :title="$t('table.layoutSave')"
    :ui="{ contentClass: 'p-x-3 p-t-3 p-b-1' }"
    @before-show="loadLayout"
    @hide="handleHide"
  >
    <Form
      :ui="{
        contentClass: 'grid md:grid-cols-2 gap-2 overflow-auto',
        controlsClass: 'p-x-0 p-b-0 p-t-1 border-t-1 m-t-3 border-ca',
      }"
      :submit-btn-props="{ size: 'sm' }"
      no-shortcuts
      no-edit-controls
      :loading="isLoading"
      :submit-disabled="!canBeSaved"
      :submit-confirmation="false"
      @submit="handleSave"
    >
      <TextInput
        v-model="layout.name"
        :label="$t('table.layoutName')"
        stack-label
        :readonly="!!layout.id"
        col=" md:span-2"
        zod="layout.name"
      />

      <Separator class=" md:col-span-2 m-y-2" />

      <!-- Left -->
      <div class="left">
        <div class="left__header">
          {{ $t('table.layoutSaveEntities') }}
        </div>

        <!-- Columns -->
        <Toggle
          v-model="toSave.columns"
          class="bg-white dark:bg-black p-x-2"
          :label="$t('table.saveColumns')"
        >
          <template #prepend>
            <div class="i-tabler:columns-2 h-5 w-5 color-blue-500" />
          </template>
        </Toggle>

        <!-- Filters -->
        <Toggle
          v-model="toSave.filters"
          class="bg-white dark:bg-black p-x-2"
          :label="$t('table.saveFilters')"
        >
          <template #prepend>
            <div class="i-ic:round-filter-alt h-5 w-5 color-blue-500" />
          </template>

          <template #append>
            <div v-if="!urlSchema.filters && toSave.filters">
              <div class="i-clarity:warning-solid w-5 h-5 color-amber-500" />

              <Tooltip>
                <span color="amber-500">
                  {{ $t('table.emptyFilters') }}
                </span>
              </Tooltip>
            </div>
          </template>
        </Toggle>

        <!-- Sort -->
        <Toggle
          v-model="toSave.sorting"
          class="bg-white dark:bg-black p-x-2"
          :label="$t('table.saveSort')"
        >
          <template #prepend>
            <div class="i-basil:sort-outline w-5 h-5 color-blue-500" />
          </template>

          <template #append>
            <div v-if="!urlSchema.sorting && toSave.sorting">
              <div class="i-clarity:warning-solid w-5 h-5 color-amber-500" />

              <Tooltip>
                <span color="amber-500">
                  {{ $t('table.emptySorting') }}
                </span>
              </Tooltip>
            </div>
          </template>
        </Toggle>
      </div>

      <!-- Right -->
      <div class="right">
        <div class="right__header">
          {{ $t('table.layoutSaveOptions') }}
        </div>

        <!-- Public -->
        <Toggle
          v-model="toSave.isPublic"
          class="bg-white dark:bg-black p-x-2"
          :label="$t('table.savePublic')"
        >
          <template #prepend>
            <div class="i-ic:round-public h-5 w-5 color-blue-500" />
          </template>
        </Toggle>

        <Toggle
          v-model="toSave.isDefault"
          class="bg-white dark:bg-black p-x-2"
          :label="$t('table.saveDefault')"
        >
          <template #prepend>
            <div class="i-fluent:book-default-28-filled h-5 w-5 color-blue-500" />
          </template>
        </Toggle>
      </div>

      <!-- Notify that layout cannot be saved -->
      <Banner
        v-if="!canBeSaved"
        variant="info"
        outlined
        col=" md:span-2"
        :label="$t('table.layoutStateAtLeastOneEntityToSave')"
      />

      <template #controls="controlsProps">
        <FormControls
          v-bind="controlsProps"
          :label="$t('general.save')"
          :submit-btn-props="{ size: 'sm' }"
          p="t-2"
        >
          <template
            v-if="layout.id"
            #prepend
          >
            <CrudBtnDelete
              size="sm"
              :label="$t('table.layoutDelete')"
              @delete="handleDelete"
            />
          </template>
        </FormControls>
      </template>
    </Form>
  </Dialog>
</template>

<style scoped lang="scss">
.left {
  @apply flex flex-col gap-2 md:h-60;

  &__header {
    @apply font-semibold text-caption p-b-1;
  }
}

.right {
  @apply flex flex-col gap-2 md:h-60 lt-md:p-t-6;

  &__header {
    @apply font-semibold text-caption p-b-1;
  }
}
</style>
