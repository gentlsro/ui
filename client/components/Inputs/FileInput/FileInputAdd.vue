<script setup lang="ts">
import type { IFileInputProps } from './types/file-input-props.type'

type IProps = Pick<IFileInputProps, 'multi'>

defineProps<IProps>()
</script>

<template>
  <Btn
    class="file-add"
    icon="i-eva:plus-fill h-8 w-8"
    size="auto"
    stacked
    color="primary"
    :label="$t('file.add', multi ? 2 : 1)"
  />
</template>

<style lang="scss" scoped>
.file-add {
  @apply fit flex-gap-4 border-2 border-dotted border-primary;
  @apply min-h-146px; // This is the height of the file preview
}
</style>
