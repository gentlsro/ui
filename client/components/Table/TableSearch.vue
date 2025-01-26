<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'

// Store
import { useTableStore } from './stores/table.store'

type IProps = Pick<ITableProps, 'search'>

defineProps<IProps>()

// Store
const { isDataLoading, internalColumns } = storeToRefs(useTableStore())

// Layout
const search = defineModel<string>('search')

const searchableColumnLabels = computed(() => {
  return internalColumns.value.filter(col => col.searchable).map(col => col.label)
})
</script>

<template>
  <SearchInput
    v-model="search"
    grow
    :debounce="500"
    :loading="isDataLoading"
  >
    <template #append>
      <Btn
        preset="HELP"
        size="sm"
        @click.stop.prevent
        @mousedown.stop.prevent
      >
        <Menu
          placement="bottom-end"
          :no-arrow="false"
        >
          <MiniCard
            :label="$t('table.searchPossibleInColumns')"
            :value="searchableColumnLabels?.join(', ')"
            value-class="!font-rem-12 color-ca"
            label-class="!font-rem-14"
          />

          <p class="non-searchable-info">
            {{ $t('table.nonSearchableColumnsInfo') }}
          </p>
        </Menu>
      </Btn>
    </template>
  </SearchInput>
</template>

<style lang="scss" scoped>
.non-searchable-info {
  @apply text-caption text-xs m-t-4 p-2 rounded-custom bg-ca text-justify
    text-last-center;
}
</style>
