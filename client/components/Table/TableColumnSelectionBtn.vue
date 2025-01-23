<script setup lang="ts">
import { klona } from 'klona/full'

// Types
import type { IListItem } from '../List/types/list-item.type'

// Models
import type { TableColumn } from './models/table-column.model'

// Functions
import { reorderArray } from '$utilsLayer/client/functions/reorder-array'

// Store
import { moveItem } from '$utils'
import { useTableStore } from './stores/table.store'

// Store
const {
  internalColumns,
  visibleColumns: visibleColumnsStore,
  nonHelperColumns,
} = storeToRefs(useTableStore())

// Layout
const visibleColumnsLocal = ref<TableColumn[]>([])

const visibleNonHelperColumns = computed(() => {
  return visibleColumnsStore.value.filter(col => !col.isHelperCol)
})

const visibleInteractiveNonHelperColumns = computed(() => {
  return visibleColumnsStore.value.filter(col => !col.isHelperCol && !col.nonInteractive)
})

function initVisibleColumns() {
  visibleColumnsLocal.value = klona(visibleInteractiveNonHelperColumns.value)
}

function isVisible(item: IListItem) {
  const col = visibleColumnsStore.value.find(col => col.field === item.id)

  return !!col
}

function isDisabledFnc(item: IListItem) {
  return item.ref.nonInteractive
}

function handleApply() {
  // Set currenty visible columns to hidden
  visibleInteractiveNonHelperColumns.value.forEach(col => col.hidden = true)

  // Set the visible columns to !hidden
  visibleColumnsLocal.value.forEach(col => {
    const colOriginal = internalColumns.value.find(c => c.field === col.field)

    if (colOriginal) {
      colOriginal.hidden = false
    }
  })

  // Move the columns according to the order in visibleColumnsLocal
  internalColumns.value = reorderArray(
    internalColumns.value,
    visibleColumnsLocal.value,
    { isMovable: col => !col.isHelperCol, isSameField: (a, b) => a.field === b.field },
  )

  $hide()
}

function handleSelectMulti(listItems: IListItem[]) {
  const items = listItems
    .map(item => item.ref)
    .filter(item => !item.nonInteractive) as TableColumn[]

  visibleColumnsLocal.value = uniqBy([...visibleColumnsLocal.value, ...items], 'field')
}

function handleDeselectMulti(listItems: IListItem[]) {
  const items = listItems
    .filter(item => !item.ref.nonInteractive)
    .map(item => item.id)

  visibleColumnsLocal.value = visibleColumnsLocal.value.filter(col => {
    return !items.includes(col.field)
  })
}

function handleMoveUp(idx: number) {
  visibleColumnsLocal.value = moveItem(visibleColumnsLocal, idx, 0)
}

function handleRemove(idx: number) {
  visibleColumnsLocal.value = visibleColumnsLocal.value.toSpliced(idx, 1)
}
</script>

<template>
  <Btn
    icon="i-tabler:columns-2"
    color="ca"
    self-center
    no-uppercase
    size="sm"
    p="!x-2"
    data-cy="columns-button"
  >
    <!-- Label -->
    <div class="items-center hidden lg:flex gap-1">
      <span text="xs">
        {{ $t('general.column', 2) }}
      </span>

      <span font="rem-10">
        ({{ visibleNonHelperColumns.length }}/{{ nonHelperColumns.length }})
      </span>
    </div>

    <div class="hidden i-flowbite:chevron-right-outline h-4 w-4 rotate-90 lt-lg:(flex absolute bottom--1.5 left-1/2 -translate-x-1/2)" />

    <Dialog
      w="screen-md"
      dense
      min-h="1/2"
      max-h="6/10"
      h="auto"
      @before-show="initVisibleColumns"
    >
      <template #title>
        <div class="dialog-title">
          <h6 p="r-2">
            {{ $t('table.customizeColumns') }}
          </h6>
        </div>

        <DocumentationBtn
          path="columnSelection"
        />
      </template>

      <Form
        no-edit-controls
        :ui="{
          contentClass: 'grow grid grid-cols-2 gap-2 overflow-auto',
          controlsClass: 'p-x-0 p-b-0 p-t-1 border-t-1 border-ca',
        }"
        :submit-btn-props="{ size: 'sm' }"
        no-shortcuts
        :label="$t('table.applyColumns')"
        :submit-disabled="!visibleColumnsLocal.length"
        :submit-confirmation="false"
        @submit="handleApply"
      >
        <!-- Left -->
        <div class="columns__left">
          <div class="columns__left-header">
            <div flex="~ gap-2 items-center">
              <h6 font="semibold rem-14">
                {{ $t('table.availableMetrics') }}
              </h6>
              <span text="caption xs">({{ nonHelperColumns.length }})</span>
            </div>
            <span text="caption xs">{{ $t('table.selectVisibleColumns') }}</span>
          </div>

          <List
            v-model:selection="visibleColumnsLocal"
            :items="nonHelperColumns"
            item-key="field"
            :selection-config="{ enabled: true, multi: true, useCheckbox: true }"
            :ui="{ rowClass: () => 'p-r-2 m-y-1px rounded-custom' }"
          >
            <template #above="{ listItems, items }">
              <div
                flex="~ gap-1 items-center justify-between"
                p="y-1 x-2"
              >
                <span text="caption xs">
                  {{ listItems.length }}
                  {{ $t('general.column', 2).toLowerCase() }}
                </span>

                <div flex="~ gap-1">
                  <!-- Select visible -->
                  <Btn
                    size="xs"
                    :label="listItems.length === items.length
                      ? $t('general.selectAll')
                      : $t('general.selectFiltered')"
                    data-cy="choose-all-columns"
                    @click="handleSelectMulti(listItems as IListItem[])"
                  />

                  <!-- Unselect visible -->
                  <Btn
                    size="xs"
                    color="negative"
                    :label="listItems.length === items.length
                      ? $t('general.clearAll')
                      : $t('general.clearFiltered')"
                    data-cy="choose-none-columns"
                    @click="handleDeselectMulti(listItems as IListItem[])"
                  />
                </div>
              </div>
            </template>

            <template #content="contentProps">
              <ListContent v-bind="contentProps">
                <template #item-row="{ row, ui }">
                  <ListRowItem
                    v-if="!('isGroup' in row)"
                    :ui
                    :disabled-fnc="isDisabledFnc"
                    :item="row"
                  >
                    <template #checkbox="{ isDisabled }">
                      <Checkbox
                        v-if="isDisabled"
                        :model-value="isVisible(row)"
                        :editable="!isDisabled"
                      />
                    </template>

                    <template #default="{ isDisabled }">
                      <div
                        flex="~ col grow"
                        p="y-1"
                      >
                        <span font="rem-14">
                          {{ row.label }}
                        </span>

                        <span
                          v-if="isDisabled"
                          font="rem-12"
                          text="caption"
                          leading="tight"
                        >
                          {{ $t('table.nonInteractiveColumn') }}
                        </span>
                      </div>
                    </template>
                  </ListRowItem>
                </template>
              </ListContent>
            </template>
          </List>
        </div>

        <!-- Right -->
        <div class="columns__right">
          <div class="columns__right-header">
            <div flex="~ gap-2 items-center">
              <h6 font="semibold rem-14">
                {{ $t('table.columnsSelected') }}
              </h6>
              <span text="caption xs">({{ visibleColumnsLocal.length }})</span>
            </div>
            <span text="caption xs">{{ $t('general.dragToReorder') }}</span>
          </div>

          <List
            v-model:items="visibleColumnsLocal"
            item-key="field"
            :search-config="{ enabled: false }"
            :sorting-config="{ enabled: false }"
            :ui="{
              rowClass: () => 'font-rem-14 rounded-custom',
              contentClass: () => '!p-x-0 p-t-1 p-b-2',
              moveHandleClass: 'p-t-2.5 color-ca',
            }"
          >
            <template #content="contentProps">
              <ListContent
                v-bind="contentProps"
                reorderable
                no-hover
              >
                <template #item="{ row, index }">
                  <span grow>
                    {{ row.label }}
                  </span>

                  <!-- Move up -->
                  <Btn
                    v-if="index"
                    size="xs"
                    icon="i-mingcute:arrow-to-up-line"
                    color="ca"
                    data-cy="arrow-pin-to-top"
                    @click="handleMoveUp(index)"
                  />

                  <!-- Remove -->
                  <Btn
                    preset="TRASH"
                    size="xs"
                    m="l--1"
                    data-cy="trash-icon"
                    @click="handleRemove(index)"
                  />
                </template>
              </ListContent>
            </template>
          </List>
        </div>
      </Form>
    </Dialog>
  </Btn>
</template>

<style scoped lang="scss">
.dialog-title {
  @apply flex flex-col gap-1 p-t-2 p-b-1 grow;
}

.columns__left {
  @apply flex flex-col gap-2 overflow-auto border-r-1 border-ca;

  &-header {
    @apply flex flex-col p-t-2 p-l-2;
  }
}

.columns__right {
  @apply flex flex-col gap-2 overflow-auto;

  &-header {
    @apply flex flex-col p-t-2 p-l-2;
  }
}
</style>
