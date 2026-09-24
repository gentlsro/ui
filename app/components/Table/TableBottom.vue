<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'

// Store
import { useTableStore } from './stores/table.store'

// Constants
import { TABLE_DEFAULT_PROPS } from './constants/table-default-props.constant'

type IProps = Pick<ITableProps, 'ui'>

const props = defineProps<IProps>()

// Store
const {
  isInitialLoad,
  isDataLoading,
  isMetaLoading,
  paginationConfig,
  rowsLimit,
  rows,
} = useTableStore()

const isLimitReached = computed(() => {
  if (!rowsLimit.value) {
    return false
  }

  return rows.value.length >= rowsLimit.value
})

const bottomClass = computed(() => {
  return props.ui?.bottomClass?.({
    defaults: TABLE_DEFAULT_PROPS.ui.bottomClass(),
  })
})

const bottomStyle = computed(() => {
  return props.ui?.bottomStyle?.()
})
</script>

<template>
  <div
    class="table-bottom"
    :class="bottomClass"
    :style="bottomStyle"
  >
    <!-- Left -->
    <div class="table-bottom__left">
      <TableTotalRows />
    </div>

    <!-- Center -->
    <div class="table-bottom__center">
      <TablePagination v-if="paginationConfig?.enabled" />

      <!-- Limit reached -->
      <div
        v-else-if="isLimitReached"
        class="table-bottom__limit"
      >
        <div class="i-lucide:info w-3.5 h-3.5 shrink-0" />

        <span>{{ $t('table.limitRowsReached') }}</span>

        <Tooltip
          placement="top"
          w="120"
          :offset="8"
          text="center caption"
          font="!rem-13"
        >
          {{ $t('table.limitRowsReachedTooltip') }}
        </Tooltip>
      </div>

      <!-- Loading, covers the pagination so it cannot be used meanwhile -->
      <slot
        v-if="!isInitialLoad && (isDataLoading || isMetaLoading)"
        name="loading"
        :is-data-loading
        :is-meta-loading
      >
        <div
          class="table-bottom__loading"
          :class="{ 'is-overlay': paginationConfig?.enabled || isLimitReached }"
        >
          <LoaderInline class="h-5! w-12!" />
        </div>
      </slot>
    </div>

    <!-- Right -->
    <div class="table-bottom__right">
      <template v-if="paginationConfig?.enabled">
        <span
          text="caption"
          class="hidden @lg:block"
        >
          {{ $t('table.rowsPerPage') }}
        </span>

        <Selector
          v-model="paginationConfig.pageSize"
          :options="paginationConfig.options"
          no-search
          no-sort
          size="sm"
          emit-key
          layout="inline"
          :clearable="false"
          :list-props="{
            ui: {
              rowContentClass: ({ defaults }) => `${defaults.all} flex-center`,
            },
          }"
          :ui="{
            borderColor: {
              base: (isDark: boolean) => isDark ? '#404040' : '#e5e5e5',
              hover: (isDark: boolean) => isDark ? '#525252' : '#d4d4d4',
            },
            borderRadius: '0.5rem',
          }"
          :no-menu-match-width="true"
        />
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-bottom {
  &__left {
    @apply flex items-center min-w-0;
  }

  &__center {
    @apply relative flex items-center justify-center;
  }

  &__right {
    @apply flex items-center justify-end gap-2 min-w-0;
  }

  &__limit {
    @apply flex items-center gap-1.5 h-6 p-x-2.5 rounded-full font-medium whitespace-nowrap cursor-default
      bg-amber-50 color-amber-700 dark:bg-amber-900/30 dark:color-amber-300;
  }

  &__loading {
    @apply flex flex-center;

    // Sits on top of the pagination (or limit notice) and swallows its clicks
    &.is-overlay {
      @apply absolute inset-0 z-1 rounded-lg cursor-wait
        bg-white/75 dark:bg-darker/75 backdrop-blur-[1px];
    }
  }
}
</style>
