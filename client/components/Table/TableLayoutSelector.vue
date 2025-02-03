<script setup lang="ts">
// Types
import type { ITableLayout } from './types/table-layout.type'

// Functions
import { useTableAutoFit } from './composables/useTableAutoFit'
import { tableTransformColumns } from './functions/table-transform-columns'
import { queryBuilderInitializeItems } from '../QueryBuilder/functions/query-builder-initialize-items'

// Store
import { useTableStore } from './stores/table.store'
import { tableDeleteLayout } from './functions/table-delete-layout'

// Utils
const { fitColumns } = useTableAutoFit()

// Store
const {
  internalColumns,
  state,
  modifiers,
  queryBuilder: queryBuilderStore,
  onDataFetchQueue,
} = storeToRefs(useTableStore())

const { deleteLayout = tableDeleteLayout } = modifiers.value ?? {}

// Layout
const menuEl = useTemplateRef('menuEl')
const isOptionsDialogOpen = ref(false)
const isLayoutSaveDialogOpen = ref(false)
const layoutSelected = ref<ITableLayout>()
const actionsVisibleForId = ref<string | number>()

function handleLayoutEdit(layout: any) {
  $hide()
  layoutSelected.value = layout
  isLayoutSaveDialogOpen.value = true
}

async function handleDelete(layout: any) {
  await deleteLayout({
    layout,
    layouts: state.value.layouts,
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

  const {
    columns,
    queryBuilder,
  } = tableTransformColumns({
    internalColumns: internalColumns.value,
    modifiers: modifiers.value,
    schemaParams: layout?.schema ?? '',
    urlParams: '',
    shouldUrlBeUsed: false,
  })

  internalColumns.value = columns
  queryBuilderStore.value = queryBuilder.length ? queryBuilder : queryBuilderInitializeItems()

  $hide()
}

function getLayoutIcons() {
  return [
    [],
  ]
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
      ref="menuEl"
      placement="bottom-end"
      w="100"
      :no-arrow="false"
      no-uplift
    >
      <List
        :items="state.layouts"
        item-label="name"
        data-cy="scheme-search"
        :ui="{ rowClass: () => 'p-r-2 m-y-1px rounded-custom !cursor-pointer' }"
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
          <span grow>
            {{ row.label }}
          </span>

          <div
            class="layout-actions"
            :class="{ 'is-active': actionsVisibleForId === row.id }"
          >
            <Btn
              size="xs"
              preset="EDIT"
              @click.stop.prevent="handleLayoutEdit(row.ref)"
            />
            <CrudBtnDelete
              size="xs"
              @click.stop.prevent
              @show="actionsVisibleForId = row.id"
              @hide="actionsVisibleForId = undefined"
              @delete="handleDelete(row.ref)"
            />
          </div>
        </template>
      </List>
    </Menu>

    <!-- Options dialog -->
    <TableOptionsDialog v-model="isOptionsDialogOpen" />

    <!-- Layout save dialog -->
    <TableLayoutSaveDialog
      v-model="isLayoutSaveDialogOpen"
      :layout="layoutSelected"
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
