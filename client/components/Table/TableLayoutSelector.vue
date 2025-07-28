<script setup lang="ts">
// Types
import type { ITableLayout } from './types/table-layout.type'

// Functions
import { useTableAutoFit } from './composables/useTableAutoFit'
import { tableDeleteLayout } from './functions/table-delete-layout'
import { tableOnLayoutApply } from './functions/table-on-layout-apply'
import { tableGetLayoutMeta } from './functions/table-get-layout-meta'
import { tableTransformColumns } from './functions/table-transform-columns'
import { queryBuilderInitializeItems } from '../QueryBuilder/functions/query-builder-initialize-items'

// Store
import { useTableStore } from './stores/table.store'

// Utils
const { isLoading, handleRequest } = useRequest()
const { fitColumns } = useTableAutoFit()

// Store
const {
  internalColumns,
  state,
  modifiers,
  queryBuilder: queryBuilderStore,
  onDataFetchQueue,
  customData,
} = storeToRefs(useTableStore())

const {
  deleteLayout = tableDeleteLayout,
  getLayoutMeta = tableGetLayoutMeta,
} = modifiers.value ?? {}

// Layout
const isOptionsDialogOpen = ref(false)
const isLayoutSaveDialogOpen = ref(false)
const layoutSelected = ref<ITableLayout>()
const isActionsVisibleLayoutId = ref<string | number>()
const search = ref('')

function handleLayoutEdit(layout: any) {
  $hide()
  layoutSelected.value = layout
  isLayoutSaveDialogOpen.value = true
}

async function handleDelete(layout: any) {
  await deleteLayout({
    layout,
    layouts: state.value.layouts,
    handleRequest,
    customData: customData.value,
  })

  $hide({ all: true })
}

function handleLayoutApply(layout?: ITableLayout) {
  if (!layout) {
    // We reset filters, query builder, sorting and selection
    queryBuilderStore.value = queryBuilderInitializeItems()

    internalColumns.value.forEach(col => {
      if (!col.nonInteractive && !col.isHelperCol) {
        col.clearFilters()
        col.sort = undefined
        col.sortOrder = undefined
        col.hidden = true
      }
    })

    layout = state.value.layoutDefault
    onDataFetchQueue.value.push(fitColumns)
  }

  const { onLayoutApply = tableOnLayoutApply } = modifiers.value ?? {}
  const _layout = onLayoutApply(layout!)

  const {
    columns,
    queryBuilder,
  } = tableTransformColumns({
    internalColumns: internalColumns.value,
    modifiers: modifiers.value,
    defaultSchema: _layout?.schema ?? '',
    urlSchema: '',
    shouldUrlBeUsed: false,
  })

  internalColumns.value = columns
  queryBuilderStore.value = queryBuilder.length ? queryBuilder : queryBuilderInitializeItems()

  $hide()
}
</script>

<template>
  <Btn
    icon="i-solar:eye-linear lg:m-r-1"
    p="!x-2"
    size="sm"
    color="ca"
    no-uppercase
  >
    <!-- Label -->
    <div class="items-center hidden lg:flex gap-1">
      <span text="xs">
        {{ $t('table.useLayout') }}
      </span>
    </div>

    <div class="i-flowbite:chevron-right-outline h-4 w-4 rotate-90 lt-lg:(absolute bottom--1.5 left-1/2 -translate-x-1/2)" />

    <!-- Layout selector menu -->
    <Menu
      placement="bottom-end"
      w="100"
      :no-arrow="false"
      no-uplift
    >
      <List
        v-model:search="search"
        :items="state.layouts"
        item-label="name"
        data-cy="scheme-search"
        :ui="{ rowClass: () => 'flex-col p-r-2 m-y-1px rounded-custom !cursor-pointer p-y-1' }"
        p="y-1"
        @click:item="handleLayoutApply($event.ref as any)"
      >
        <template #above>
          <div class="actions">
            <!-- Save -->
            <Btn
              icon="i-material-symbols:save"
              size="xs"
              color="positive"
              no-uppercase
              :label="$t('general.save')"
              data-cy="settings"
              @click="[$hide(), isLayoutSaveDialogOpen = true]"
            />

            <div flex="~ gap-2">
              <!-- Layout options -->
              <Btn
                icon="i-solar:settings-linear"
                size="xs"
                color="ca"
                no-uppercase
                :label="$t('general.option', 2)"
                @click="[$hide(), isOptionsDialogOpen = true]"
              />

              <!-- Reset -->
              <Btn
                size="xs"
                color="negative"
                no-uppercase
                icon="i-carbon:reset"
                :label="$t('table.layoutStateReset')"
                @click="handleLayoutApply()"
              />
            </div>
          </div>
        </template>

        <template #item="{ row }">
          <div
            flex="~ gap-2"
            w="full"
          >
            <span grow>
              {{ row.label }}
            </span>

            <div
              class="layout-actions"
              :class="{ 'is-active': isActionsVisibleLayoutId === row.id }"
            >
              <Btn
                size="xs"
                preset="EDIT"
                :loading="isLoading"
                @click.stop.prevent="handleLayoutEdit(row.ref)"
              />
              <CrudBtnDelete
                size="xs"
                :loading="isLoading"
                @click.stop.prevent
                @before-show="isActionsVisibleLayoutId = row.id"
                @hide="isActionsVisibleLayoutId = undefined"
                @delete="handleDelete(row.ref)"
              />
            </div>
          </div>

          <TableLayoutMeta v-bind="getLayoutMeta(row.ref as ITableLayout)" />
        </template>
      </List>
    </Menu>

    <!-- Options dialog -->
    <TableOptionsDialog v-model="isOptionsDialogOpen" />

    <!-- Layout save dialog -->
    <TableLayoutSaveDialog
      v-model="isLayoutSaveDialogOpen"
      :layout="layoutSelected"
      :search
      @hide="layoutSelected = undefined"
    />
  </Btn>
</template>

<style scoped lang="scss">
.actions {
  @apply flex gap-1 items-center justify-between p-x-2 m-b-1;
}

.layout-actions {
  @apply items-center bg-white dark:bg-black rounded-custom hidden;
}

.list-row-item:hover .layout-actions,
.layout-actions.is-active {
  @apply flex;
}

@media (hover: none) and (pointer: coarse) {
  .layout-actions {
    @apply flex;
  }
}
</style>
