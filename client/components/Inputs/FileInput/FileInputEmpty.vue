<script setup lang="ts">
// Types
import type { IFileInputProps } from './types/file-input-props.type'

type IProps = Pick<IFileInputProps, 'multi'>

defineProps<IProps>()
</script>

<template>
  <div class="file-input__empty">
    <div class="i-material-symbols:upload w-16 h-16" />
    <div
      flex="~ col"
      text="center"
      p="x-3"
    >
      {{ $t('file.upload', multi ? 2 : 1) }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.file-input__empty {
  @apply absolute grid place-content-center place-items-center inset-0;
  @apply color-true-gray-500 pointer-events-none;
}

.file-input:hover {
  .file-input__empty {
    @apply color-darker dark:color-light-800;
  }
}
</style>
