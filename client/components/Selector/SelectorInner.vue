<script setup lang="ts">
// Types
import type { ISelectorProps } from './types/selector-props.type'

// Store
import { useSelectorStore } from './stores/selector.store'
import { getListItemLabel } from '../List/functions/helpers'

type IProps = Pick<ISelectorProps, 'useScroller' | 'ui' | 'maxChipsRows' | 'readonly' | 'disabled' | 'emptyValue' | 'multi' | 'optionLabel'>

const props = defineProps<IProps>()

// Store
const { model } = storeToRefs(useSelectorStore())

// Layout
const isMulti = toRef(props, 'multi')

const modelArray = computed(() => {
  if (!model.value || model.value === props.emptyValue) {
    return []
  }

  return Array.isArray(model.value) ? model.value : [model.value]
})

const maxHeight = computed(() => {
  return `${(props.maxChipsRows ?? 0) * 24}px`
})

const isEditable = computed(() => {
  return !props.readonly && !props.disabled
})

function handleRemove(idx: number) {
  if (Array.isArray(model.value)) {
    model.value = model.value.filter((_, i) => i !== idx)
  } else {
    model.value = props.emptyValue
  }
}
</script>

<template>
  <span v-if="!isMulti">
    {{ getListItemLabel(model, optionLabel) }}
  </span>

  <HorizontalScroller
    v-else-if="useScroller"
    :class="ui?.innerClass"
    :style="ui?.innerStyle"
  >
    <SelectorChip
      v-for="(file, idx) in modelArray"
      :key="idx"
      :chip="file"
      :class="ui?.chipClass"
      :style="ui?.chipStyle"
      :option-label
      @remove="handleRemove(idx)"
    />
  </HorizontalScroller>

  <ScrollArea
    v-else
    class="selector__inner"
    :class="[ui?.innerClass, { 'is-editable': isEditable }]"
    :style="{ ...ui?.innerStyle, maxHeight }"
  >
    <SelectorChip
      v-for="(file, idx) in modelArray"
      :key="idx"
      :chip="file"
      :class="ui?.chipClass"
      :style="ui?.chipStyle"
      :option-label
      @remove="handleRemove(idx)"
    />
  </ScrollArea>
</template>

<style lang="scss" scoped>
.selector__inner {
  @apply flex items-center gap-1 flex-wrap;
}
</style>
