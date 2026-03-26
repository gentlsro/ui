<script setup lang="ts">
// Types
import type { ITableLayout } from './types/table-layout.type'

// Functions
import { useTableAutoFit } from './composables/useTableAutoFit'
import { tableApplyLayout } from './functions/table-apply-layout'
import { tableDeleteLayout } from './functions/table-delete-layout'
import { tableGetLayoutMeta } from './functions/table-get-layout-meta'

// Store
import { useTableStore } from './stores/table.store'

// Utils
const { isLoading, fn } = useFn({
  source: { type: 'component', name: 'TableLayoutSelector' },
})
const { fitColumns } = useTableAutoFit()

// Store
const store = useTableStore()
const {
  state,
  modifiers,
  onDataFetchQueue,
  customData,
} = store

const {
  deleteLayout = tableDeleteLayout,
  getLayoutMeta = tableGetLayoutMeta,
} = modifiers.value ?? {}

// Layout
const isOptionsDialogOpen = ref(false)
const isLayoutSaveDialogOpen = ref(false)
const layoutSelected = ref<ITableLayout>()
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
    fn,
    customData: customData.value,
  })

  $hide({ all: true })
}

function handleLayoutApply(layout?: ITableLayout) {
  tableApplyLayout({ layout, getStore: () => store })

  onDataFetchQueue.value.push(fitColumns)
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
        :search-config="{ inputProps: { size: 'sm' } }"
        :ui="{ rowClass: ({ defaults }) => `${defaults.all} flex-col cursor-pointer items-start! p-y-1.5 light:(border-1 border-ca) dark:bg-black` }"
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

          <!-- Actions -->
          <div class="layout-item-actions">
            <Btn
              size="xs"
              preset="EDIT"
              :loading="isLoading"
              @click.stop.prevent="handleLayoutEdit(row.ref)"
            />

            <CrudBtnDelete
              size="xs"
              :loading="isLoading"
              :menu-props="{ title: '' }"
              @click.stop.prevent
              @delete="handleDelete(row.ref)"
            >
              <template #confirmation>
                <div flex="~ center">
                  <div class="i-clarity:warning-solid w-8 h-8 color-negative" />
                </div>

                <span
                  text="caption center"
                  font="rem-12"
                  p="x-3 y-1"
                >
                  {{ $t('general.deleteItemConfirmation') }}
                </span>
              </template>
            </CrudBtnDelete>
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
  @apply flex items-center gap-1 justify-between p-x-2 m-b-1 m-t--2;
}

.layout-item-actions {
  @apply absolute top-1 right-1 items-center gap-px flex;
}
</style>
