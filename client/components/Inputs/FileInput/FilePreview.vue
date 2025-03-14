<script setup lang="ts">
// Models
import { FileModel } from '$utils'

// Functions
import { handleDownloadFile } from '$utilsLayer/client/functions/download-file'

// Constants
import { IMAGE_TYPES } from './constants/image-types'
import { ICON_BY_FILE_TYPE } from './constants/icon-by-file-type'

type IProps = {
  downloadUrl?: string | ((file: IFile) => string)
  editable?: boolean
  file: FileModel | IFile
  noDownloadButton?: boolean
  fileDownloadTitle?: string

  /**
   * When true, the preview will not be shown, just an icon
   */
  noPreview?: boolean
}

const props = defineProps<IProps>()
defineEmits<{
  (e: 'remove'): void
}>()

// Utils
const { formatNumber, formatBytes } = useNumber()
const { getLocalImageUrl } = useImages()

const icon = computed(() => {
  const icon = ICON_BY_FILE_TYPE[props.file.type as keyof typeof ICON_BY_FILE_TYPE]
    || 'i-solar:file-linear'

  return icon
})

const imageUrl = computed(() => {
  if (props.noPreview) {
    return
  }

  const isImageFile = IMAGE_TYPES.includes(props.file.type ?? '')

  if (!isImageFile) {
    return null
  }

  if (props.file instanceof FileModel) {
    return URL.createObjectURL(props.file.file)
  } else {
    return getLocalImageUrl(props.file.path)
  }
})
</script>

<template>
  <div class="file-preview">
    <div class="file-preview__header">
      <span class="file-preview__filename">
        {{ file.name }}
      </span>

      <Btn
        v-if="editable"
        size="xs"
        preset="CLOSE"
        self-start
        @click.stop.prevent="$emit('remove')"
      />
    </div>

    <div class="file-preview__image">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="file.name"
        height="100"
      >

      <div
        v-else
        :class="icon"
        h="10"
        w="10"
      />
    </div>

    <div
      v-if="!noDownloadButton"
      class="file-preview__download rounded-b-2 overflow-hidden"
    >
      <!-- Download file -->
      <Btn
        v-if="'path' in file || !(file instanceof FileModel)"
        w-full
        size="sm"
        class="!rounded-t-0"
        :label="fileDownloadTitle ?? $t('file.download')"
        @click.stop.prevent="handleDownloadFile(file, { url: downloadUrl })"
      />

      <!-- Upload failed -->
      <Btn
        v-else-if="file.hasError"
        :label="$t('file.uploadFailed')"
        color="negative"
        bg="negative/15"
        size="sm"
        class="!rounded-t-0 w-full"
      />

      <!-- To be uploaded -->
      <div
        v-else-if="!file.isUploading && !file.isUploaded"
        :label="$t('file.added')"
        class="flex flex-center rounded-t-0 w-full h-8 bg-blue-50 dark:bg-dark text-caption text-xs rounded-custom"
      >
        {{ formatBytes(file.file.size) }}
      </div>

      <!-- Uploaded successfully -->
      <Btn
        v-else-if="!file.isUploading"
        :label="$t('file.uploaded')"
        color="positive"
        size="sm"
        class="!rounded-t-0 w-full"
      />

      <!-- Uploading - Progress bar -->
      <ProgressBar
        v-else
        :label="progress => `${$t('file.uploading')}... (${formatNumber(progress)}%)`"
        :progress="file.uploadProgress"
        rounded="b-2"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.file-preview {
  @apply grid gap-2 fit items-center border-1 border-dotted rounded-3
    border-ca color-ca h-auto;

  grid-template-rows: auto 1fr auto;

  &__filename {
    @apply self-center text-caption line-clamp-2 m-y-1 break-words;
  }

  &__header {
    @apply flex flex-row gap-x-2 p-x-2 w-full justify-between p-t-1 p-b-2
      overflow-auto;
  }

  &__image {
    @apply flex flex-center p-b-4 p-x-3;

    img {
      @apply rounded-3 object-cover object-center h-20;
    }
  }

  &:hover {
    @apply shadow-consistent-xs shadow-ca color-dark dark:color-light;
  }
}
</style>
