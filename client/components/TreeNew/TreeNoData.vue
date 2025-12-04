<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeProps } from './types/tree-props.new.type'

type IProps = Pick<ITreeProps<T>, 'ui'>

defineProps<IProps>()
</script>

<template>
  <div
    class="tree-no-data"
    :class="ui?.noDataClass"
    :style="ui?.noDataStyle"
  >
    {{ $t('general.noData') }}
  </div>
</template>
