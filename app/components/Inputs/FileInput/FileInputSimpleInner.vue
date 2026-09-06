<script setup lang="ts" vapor>
// Types
import type { IFileInputProps } from './types/file-input-props.type'

const props = defineProps<IFileInputProps & {
  fileRemoveFnc: (idx: number | string) => void
  openFileDialog: () => void
}>()

// Layout
const model = toRef(props, 'modelValue')

const maxHeight = computed(() => {
  return `${(props.maxChipsRows ?? 0) * 24}px`
})

const isEditable = computed(() => {
  return !props.readonly && !props.disabled
})

function handleClick() {
  if (isEditable.value) {
    props.openFileDialog()
  }
}
</script>

<template>
  <HorizontalScroller
    v-if="useScroller"
    :class="ui?.innerClass"
    :style="ui?.innerStyle"
    @click.stop="handleClick"
  >
    <FileChip
      v-for="(file, idx) in model"
      :key="idx"
      :chip="file"
      :readonly
      :disabled
      :class="ui?.chipClass"
      :style="ui?.chipStyle"
      :no-download-button
      @remove="fileRemoveFnc(idx)"
    />
  </HorizontalScroller>

  <ScrollArea
    v-else
    class="file-input-simple__inner"
    :class="[ui?.innerClass, { 'is-editable': isEditable, 'is-multi': multi }]"
    :style="{ ...ui?.innerStyle, maxHeight }"
    @click.stop="handleClick"
  >
    <FileChip
      v-for="(file, idx) in model"
      :key="idx"
      :chip="file"
      :readonly
      :disabled
      :class="ui?.chipClass"
      :style="ui?.chipStyle"
      :no-download-button
      @remove="fileRemoveFnc(idx)"
    />
  </ScrollArea>
</template>

<style lang="scss" scoped>
.file-input-simple__inner {
  @apply flex items-center gap-1 flex-wrap;
}
</style>
