<script setup lang="ts" vapor>
// Types
import type { IFileInputProps } from './types/file-input-props.type'

// Functions
import { getFileLabel } from './functions/get-file-label'

type IProps = Pick<IFileInputProps, 'disabled' | 'readonly' | 'downloadUrl' | 'noDownloadButton'>
  & { chip: File | IFile | FileModel }

const props = defineProps<IProps>()

defineEmits<{
  (e: 'remove'): void
}>()

const { formatBytes } = useNumber()
const label = computed(() => getFileLabel(props.chip, formatBytes))
</script>

<template>
  <Chip
    :label="label"
    min-w="20"
    h="6.5"
    p="!y-0"
    :has-remove="!(readonly || disabled)"
    @click.stop.prevent
    @remove="$emit('remove')"
  >
    <!-- Download btn -->
    <Btn
      v-if="!noDownloadButton && 'path' in chip"
      size="auto"
      w="5"
      h="5"
      bg="primary"
      color="white"
      self-center
      icon="i-material-symbols:download"
      @click.stop.prevent="handleDownloadFile(chip, { url: downloadUrl })"
      @mousedown.stop.prevent
    />

    <span truncate>
      {{ label }}
    </span>
  </Chip>
</template>
