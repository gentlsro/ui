<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeProps } from './types/tree-props.type'

// Constants
import { TREE_DEFAULT_PROPS } from './constants/tree-default-props.constant'

type IProps = Pick<ITreeProps<T>, 'ui'>

const props = defineProps<IProps>()

// Styles - No Data
const noDataClass = computed(() => {
  return props.ui?.noDataClass?.({
    defaults: TREE_DEFAULT_PROPS.ui.noDataClass(),
  })
})

const noDataStyle = computed(() => {
  return props.ui?.noDataStyle?.()
})
</script>

<template>
  <div
    class="tree-no-data"
    :class="noDataClass"
    :style="noDataStyle"
  >
    {{ $t('general.noData') }}
  </div>
</template>
