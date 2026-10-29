<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeProps } from './types/tree-props.type'

// Constants
import { TREE_LAYERED_CLASSES } from './constants/tree-layered-classes.constant'

type IProps = Pick<ITreeProps<T>, 'ui'>

const props = defineProps<IProps>()

// Styles - No Data
const noDataClass = computed(() => {
  return props.ui?.noDataClass?.({
    defaults: TREE_LAYERED_CLASSES.noDataClass(),
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
