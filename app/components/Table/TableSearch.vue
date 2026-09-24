<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'

// Store
import { useTableStore } from './stores/table.store'

type IProps = Pick<ITableProps, 'search'>

defineProps<IProps>()

// Store
const { isDataLoading, internalColumns } = useTableStore()

// Layout
const search = defineModel<string>('search')
const searchInputEl = useTemplateRef('searchInputEl')

const searchableColumnLabels = computed(() => {
  return internalColumns.value.filter(col => col.searchable).map(col => col._label)
})
</script>

<template>
  <SearchInput
    ref="searchInputEl"
    v-model="search"
    class="table-search"
    :ui="{
      borderColor: {
        base: (isDark: boolean) => isDark ? '#404040' : '#e5e5e5',
        hover: (isDark: boolean) => isDark ? '#525252' : '#d4d4d4',
      },
      borderRadius: '0.5rem',
    }"
    size="sm"
    :debounce="500"
    :loading="isDataLoading && !!search"
    :error-takes-space="false"
    :error-visible="false"
  >
    <template #append>
      <Btn
        icon="i-lucide:info"
        size="xs"
        class="table-search__help"
        @click.stop.prevent
        @mousedown.stop.prevent
      >
        <!-- Opens right below the whole input, not the small help button -->
        <Menu
          :reference-target="searchInputEl"
          placement="bottom-start"
          :offset="4"
          match-width
        >
          <div class="table-search-help">
            <span class="table-search-help__title">
              {{ $t('table.searchPossibleInColumns') }}
            </span>

            <div class="table-search-help__columns">
              <span
                v-for="label in searchableColumnLabels"
                :key="label"
                class="table-search-help__column"
              >
                {{ label }}
              </span>
            </div>

            <p class="table-search-help__hint">
              <span class="i-lucide:info w-3.5 h-3.5 shrink-0 m-t-2px" />
              {{ $t('table.nonSearchableColumnsInfo') }}
            </p>
          </div>
        </Menu>
      </Btn>
    </template>
  </SearchInput>
</template>

<style lang="scss" scoped>
.table-search {
  @apply w-full max-w-72;

  &__help {
    @apply color-true-gray-400 rounded-md m-r-1;

    &:hover {
      @apply color-true-gray-700 dark:color-true-gray-200;
    }
  }
}

.table-search-help {
  @apply flex flex-col gap-2 p-1;

  &__title {
    @apply text-xs font-medium color-true-gray-500 dark:color-true-gray-400;
  }

  &__columns {
    @apply flex flex-wrap gap-1;
  }

  &__column {
    @apply h-6 inline-flex items-center p-x-2 rounded-md text-xs font-medium
      bg-true-gray-100 color-true-gray-700 dark:bg-true-gray-800 dark:color-true-gray-200;
  }

  &__hint {
    @apply flex gap-1.5 p-t-2 border-t-1 border-true-gray-100 dark:border-true-gray-800
      text-xs leading-snug color-true-gray-500 dark:color-true-gray-400;
  }
}
</style>
