<script setup lang="ts">
import { klona } from 'klona/full'

// Types
import type { IListItem } from '../List/types/list-item.type'

// Models
import type { TableColumn } from './models/table-column.model'

// Functions
import { reorderArray } from './functions/reorder-array'
import { useTableAutoFit } from './composables/useTableAutoFit'

// Store
import { useTableStore } from './stores/table.store'

// Store
const {
  internalColumns,
  visibleColumns: visibleColumnsStore,
  nonHelperColumns,
  onDataFetchQueue,
} = useTableStore()

// Utils
const { fitColumns } = useTableAutoFit()

// Layout
const visibleColumnsLocal = ref([]) as Ref<TableColumn[]>

const interactiveNonHelperColumns = computed(() => {
  return nonHelperColumns.value.filter(col => !col.nonInteractive)
})

const visibleNonHelperColumns = computed(() => {
  return visibleColumnsStore.value.filter(col => !col.isHelperCol)
})

const visibleInteractiveNonHelperColumns = computed(() => {
  return visibleColumnsStore.value.filter(col => !col.isHelperCol && !col.nonInteractive)
})

// Locked columns (not reorderable) are listed above the draggable ones, so
// nothing can be dropped before them
const lockedColumnsLocal = computed(() => {
  return visibleColumnsLocal.value.filter(col => !col.reorderable)
})

const movableColumnsLocal = computed({
  get: () => visibleColumnsLocal.value.filter(col => col.reorderable),
  set: columns => visibleColumnsLocal.value = [...lockedColumnsLocal.value, ...columns],
})

function initVisibleColumns() {
  // Always visible columns are included even when a saved state hid them
  const columns = uniqBy([
    ...visibleInteractiveNonHelperColumns.value,
    ...interactiveNonHelperColumns.value.filter(col => col.alwaysVisible),
  ], 'field')

  visibleColumnsLocal.value = klona(columns)
}

function isVisible(item: IListItem) {
  const col = visibleColumnsStore.value.find(col => col.field === item.id)

  return !!col
}

function isDisabledFnc(item: IListItem) {
  return item.ref.nonInteractive || item.ref.alwaysVisible
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

  // Move the columns according to the order in visibleColumnsLocal;
  // locked columns keep their position
  internalColumns.value = reorderArray(
    internalColumns.value,
    visibleColumnsLocal.value,
    { isMovable: col => !col.isHelperCol && col.reorderable, isSameField: (a, b) => a.field === b.field },
  )

  // Adjust the `_internalSort`
  internalColumns.value.forEach((col, idx) => {
    if (!col.hidden) {
      col._internalSort = idx
    }
  })

  onDataFetchQueue.value.push(fitColumns)
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
    .filter(item => !item.ref.nonInteractive && !item.ref.alwaysVisible)
    .map(item => item.id)

  visibleColumnsLocal.value = visibleColumnsLocal.value.filter(col => {
    return !items.includes(col.field)
  })
}

function handleMoveUp(idx: number) {
  movableColumnsLocal.value = moveItem(movableColumnsLocal.value, idx, 0)
}

function handleRemove(idx: number) {
  movableColumnsLocal.value = movableColumnsLocal.value.toSpliced(idx, 1)
}
</script>

<template>
  <Btn
    icon="i-lucide:columns-3"
    class="table-toolbar-btn"
    self-center
    no-uppercase
    size="sm"
    p="!x-2"
    data-cy="columns-button"
  >
    <!-- Label -->
    <div class="items-center hidden @2xl:flex gap-1">
      <span text="xs">
        {{ $t('general.column', 2) }}
      </span>

      <span font="rem-10">
        ({{ visibleNonHelperColumns.length }}/{{ interactiveNonHelperColumns.length }})
      </span>
    </div>

    <div class="hidden i-lucide:chevron-down w-3.5 h-3.5 opacity-60 shrink-0 lt-lg:(flex absolute bottom--1.5 left-1/2 -translate-x-1/2)" />

    <Dialog
      w="screen-md"
      min-h="1/2"
      max-h="8/10"
      h="auto"
      position="top"
      dense
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

        <!-- <Btn
          size="sm"
          no-uppercase
          icon="i-carbon:reset"
          :label="$t('table.resetColumnVisibility')"
        /> -->
      </template>

      <Form
        no-edit-controls
        :ui="{
          contentClass: ({ defaults }) => 'grow grid grid-cols-2 gap-2 overflow-auto',
          controlsClass: ({ defaults }) => `${defaults.all} !p-t-1 !p-x-4`,
          submitClass: ({ defaults }) => `${defaults.base} !w-auto`,
        }"
        :submit-btn-props="{ size: 'sm', noUppercase: true }"
        no-shortcuts
        :label="$t('table.applyColumns')"
        :submit-disabled="!visibleColumnsLocal.length"
        :submit-confirmation="false"
        @submit="handleApply"
      >
        <!-- Left -->
        <div class="columns__left">
          <div class="columns__left-header">
            <div class="columns__title">
              <h6>{{ $t('table.availableMetrics') }}</h6>
              <span class="columns__count">{{ nonHelperColumns.length }}</span>
            </div>
            <span class="columns__subtitle">{{ $t('table.selectVisibleColumns') }}</span>
          </div>

          <List
            v-model:selection="visibleColumnsLocal"
            :items="interactiveNonHelperColumns"
            item-key="field"
            item-label="_label"
            :selection-config="{ enabled: true, multi: true, useCheckbox: true }"
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
                    no-uppercase
                    class="columns__action"
                    :label="listItems.length === items.length
                      ? $t('general.selectAll')
                      : $t('general.selectFiltered')"
                    data-cy="choose-all-columns"
                    @click="handleSelectMulti(listItems as IListItem[])"
                  />

                  <!-- Unselect visible -->
                  <Btn
                    size="xs"
                    no-uppercase
                    class="columns__action columns__action--negative"
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
                <template #item-row="{ row, ui, isLast }">
                  <ListRowItem
                    v-if="!('isGroup' in row)"
                    :ui
                    :is-last
                    :disabled-fnc="isDisabledFnc"
                    :item="row"
                  >
                    <template #checkbox="{ isDisabled }">
                      <Checkbox
                        v-if="isDisabled"
                        :model-value="isVisible(row)"
                        :disabled="isDisabled"
                      />
                    </template>

                    <!-- <template #default="{ isDisabled }">
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
                    </template> -->
                  </ListRowItem>
                </template>
              </ListContent>
            </template>
          </List>
        </div>

        <!-- Right -->
        <div class="columns__right">
          <div class="columns__right-header">
            <div class="columns__title">
              <h6>{{ $t('table.columnsSelected') }}</h6>
              <span class="columns__count">{{ visibleColumnsLocal.length }}</span>
            </div>
            <span class="columns__subtitle">{{ $t('general.dragToReorder') }}</span>
          </div>

          <!-- Locked -->
          <div
            v-if="lockedColumnsLocal.length"
            class="columns__locked"
          >
            <div
              v-for="col in lockedColumnsLocal"
              :key="col.field"
              class="columns__locked-row"
              :title="$t('table.lockedColumn')"
            >
              <div class="columns__locked-icon" />

              <span grow>
                {{ col.label }}
              </span>
            </div>
          </div>

          <List
            v-model:items="movableColumnsLocal"
            item-key="field"
            item-label="_label"
            :search-config="{ enabled: false }"
            :sorting-config="{ enabled: false }"
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
                    icon="i-lucide:arrow-up-to-line"
                    class="columns__row-btn"
                    data-cy="arrow-pin-to-top"
                    @click="handleMoveUp(index)"
                  />

                  <!-- Remove -->
                  <Btn
                    icon="i-lucide:x"
                    size="xs"
                    class="columns__row-btn columns__row-btn--remove"
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

.columns {
  &__left {
    @apply flex flex-col gap-2 overflow-auto border-r-1 border-true-gray-100 dark:border-true-gray-800 p-x-2;
  }

  &__right {
    @apply flex flex-col gap-2 overflow-auto p-x-2;
  }

  &__left-header,
  &__right-header {
    @apply flex flex-col gap-0.5 p-t-2 p-l-2;
  }

  &__title {
    @apply flex items-center gap-2;

    h6 {
      @apply font-semibold font-rem-14;
    }
  }

  &__count {
    @apply inline-flex items-center h-5 p-x-1.5 rounded-md text-xs font-medium tabular-nums
      bg-true-gray-100 color-true-gray-600 dark:bg-true-gray-800 dark:color-true-gray-300;
  }

  &__subtitle {
    @apply text-xs color-true-gray-500 dark:color-true-gray-400;
  }

  &__action {
    @apply rounded-md font-medium color-true-gray-600 dark:color-true-gray-300;

    &:hover {
      @apply bg-true-gray-100 dark:bg-true-gray-800;
    }

    &--negative:hover {
      @apply color-negative bg-negative/8;
    }
  }

  &__locked {
    @apply flex flex-col m-x-2 p-b-1 border-b-1 border-true-gray-100 dark:border-true-gray-800;
  }

  &__locked-row {
    @apply flex items-center gap-1 p-y-1.5 p-l-2 font-rem-14 leading-20px color-true-gray-500 dark:color-true-gray-400;
  }

  &__locked-icon {
    @apply i-lucide:lock w-4 h-4 m-r-1 shrink-0;
  }

  &__row-btn {
    @apply rounded-md color-true-gray-400;

    &:hover {
      @apply color-true-gray-700 dark:color-true-gray-200 bg-true-gray-100 dark:bg-true-gray-800;
    }

    &--remove:hover {
      @apply color-negative bg-negative/10;
    }
  }
}
</style>
