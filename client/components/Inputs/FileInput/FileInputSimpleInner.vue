<script setup lang="ts">
// Types
import type { IFileInputProps } from './types/file-input-props.type'

const props = defineProps<IFileInputProps & {
  fileRemoveFnc: (idx: number) => void
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
  if (!props.multi) {
    props.openFileDialog()
  }
}
</script>

<template>
  <HorizontalScroller
    v-if="useScroller"
    :class="ui?.innerClass"
    :style="ui?.innerStyle"
  >
    <FileChip
      v-for="(file, idx) in model"
      :key="idx"
      :chip="file"
      :class="ui?.chipClass"
      :style="ui?.chipStyle"
      @remove="fileRemoveFnc(idx)"
    />
  </HorizontalScroller>

  <ScrollArea
    v-else
    class="file-input-simple__inner"
    :class="[ui?.innerClass, { 'is-editable': isEditable, 'is-multi': multi }]"
    :style="{ ...ui?.innerStyle, maxHeight }"
    @click="handleClick"
  >
    <FileChip
      v-for="(file, idx) in model"
      :key="idx"
      :chip="file"
      :class="ui?.chipClass"
      :style="ui?.chipStyle"
      @remove="fileRemoveFnc(idx)"
    />
  </ScrollArea>
</template>

<style lang="scss" scoped>
.file-input-simple__inner {
  @apply flex items-center gap-1 flex-wrap;
}
</style>
