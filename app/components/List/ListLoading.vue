<script setup lang="ts">
// Types
import type { IListProps } from './types/list-props.type'

// Store
import { useListStore } from './stores/list.store'

// Constants
import { LIST_DEFAULT_PROPS } from './constants/list-default-props.constant'

type IProps = Pick<IListProps, 'ui'>

const props = defineProps<IProps>()

const { isFirstFetch, items, isLoading } = useListStore()

const loadingStyle = computed(() => {
  return props.ui?.loadingStyle?.()
})

const loadingClass = computed(() => {
  return props.ui?.loadingClass?.({
    defaults: LIST_DEFAULT_PROPS.ui.loadingClass(),
  })
})
</script>

<template>
  <div
    v-if="isFirstFetch && !items.length && isLoading"
    class="list-loading"
    :class="loadingClass"
    :style="loadingStyle"
  >
    <LoaderBlock size="md" />
  </div>
</template>
