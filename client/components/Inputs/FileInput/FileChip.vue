<script setup lang="ts">
// Types
import type { IFileInputProps } from './types/file-input-props.type'

// Models
import type { FileModel } from '$utils'

// Functions
import { getFileLabel } from './functions/get-file-label'
import { handleDownloadFile } from '#layers/utilities/client/functions/download-file'

type IProps = Pick<IFileInputProps, 'disabled' | 'readonly' | 'downloadUrl' | 'noDownloadButton'>
  & { chip: File | IFile | FileModel }

defineProps<IProps>()

defineEmits<{
  (e: 'remove'): void
}>()
</script>

<template>
  <Chip
    :label="getFileLabel(chip)"
    min-w="20"
    h="7"
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
      {{ getFileLabel(chip) }}
    </span>
  </Chip>
</template>
