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
    <TableTotalRows />

    <!-- Center -->
    <TablePagination v-if="paginationConfig?.enabled" />

    <!-- Loading -->
    <slot
      v-if="!isInitialLoad && (isDataLoading || isMetaLoading)"
      name="loading"
      :is-data-loading
      :is-meta-loading
    >
      <div class="is-loading">
        <LoaderInline
          size="sm"
          rounded-full
        />
      </div>
    </slot>

    <!-- Right -->
    <div
      v-if="paginationConfig?.enabled"
      flex="~ items-center"
      m="l-auto"
    >
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
        m="l-auto"
        :list-props="{
          ui: {
            rowContentClass: ({ defaults }) => `${defaults.all} flex-center`,
          },
        }"
        :no-menu-match-width="true"
      />
    </div>

    <!-- Limit reached -->
    <div
      v-if="isLimitReached"
      class="limit-reached"
    >
      <div class="color-warning i-bi:info-lg" />
      <span font="rem-14 semibold">{{ $t('table.limitRowsReached') }}</span>

      <Tooltip
        placement="top"
        w="120"
        :offset="8"
        text="center caption"
        font="!rem-14"
      >
        {{ $t('table.limitRowsReachedTooltip') }}
      </Tooltip>
    </div>
  </div>
</template>
