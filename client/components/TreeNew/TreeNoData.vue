<script setup lang="ts">
// Types
import type { ITreeProps } from './types/tree-props.new.type'

type IProps = Pick<ITreeProps, 'ui'>

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
