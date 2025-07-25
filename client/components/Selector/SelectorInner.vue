<script setup lang="ts">
// Types
import type { ISelectorProps } from './types/selector-props.type'
import type { ISelectorEmits } from './types/selector-emits.type'

// Store
import { useSelectorStore } from './stores/selector.store'
import { getListItem, getListItemLabel } from '../List/functions/helpers'

type IProps = Pick<
  ISelectorProps,
  | 'useScroller' | 'ui' | 'maxChipsRows' | 'readonly' | 'disabled'
  | 'emptyValue' | 'multi' | 'optionLabel' | 'optionTo' | 'to' | 'name'
> & { emits: ISelectorEmits }

const props = defineProps<IProps>()

// Store
const { model, optionByKey } = storeToRefs(useSelectorStore())

// Layout
const isMulti = toRef(props, 'multi')

const to = computed(() => {
  if (typeof props.to === 'function') {
    return props.to(model.value)
  }

  return props.to
})

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
    const item = model.value[idx]
    props.emits('unselect:item', item)

    model.value = model.value.toSpliced(idx, 1)
  } else {
    props.emits('unselect:item', model.value)
    model.value = props.emptyValue
  }
}
</script>

<template>
  <Component
    :is="to ? 'NuxtLink' : 'span'"
    v-if="!isMulti"
    :to
    :target="to ? '_blank' : undefined"
    truncate
  >
    <slot
      :item="getListItem(model, optionByKey) ?? model"
      :index="0"
      :option-by-key
    >
      {{ getListItemLabel(model, optionLabel, optionByKey) }}
    </slot>
  </Component>

  <HorizontalScroller
    v-else-if="useScroller"
    :class="ui?.innerClass"
    :style="ui?.innerStyle"
  >
    <template
      v-for="(item, idx) in modelArray"
      :key="idx"
    >
      <slot
        :item="getListItem(item, optionByKey) ?? item"
        :index="idx"
        :option-by-key
      >
        <SelectorChip
          :chip="item"
          :class="ui?.chipClass"
          :style="ui?.chipStyle"
          :option-label
          :option-by-key
          :readonly
          :disabled
          :navigate-to-options="{ target: '_blank' }"
          :to="optionTo?.(item)"
          @remove="handleRemove(idx)"
        />
      </slot>
    </template>
  </HorizontalScroller>

  <ScrollArea
    v-else
    class="selector__inner"
    :class="[ui?.innerClass, { 'is-editable': isEditable }]"
    :style="{ ...ui?.innerStyle, maxHeight }"
  >
    <template
      v-for="(item, idx) in modelArray"
      :key="idx"
    >
      <slot
        :item="getListItem(item, optionByKey) ?? item"
        :index="idx"
        :option-by-key
      >
        <SelectorChip
          :chip="item"
          :class="ui?.chipClass"
          :style="ui?.chipStyle"
          :option-label
          :option-by-key
          :readonly
          :disabled
          :navigate-to-options="{ target: '_blank' }"
          :to="optionTo?.(item)"
          @remove="handleRemove(idx)"
        />
      </slot>
    </template>
  </ScrollArea>
</template>

<style lang="scss" scoped>
.selector__inner {
  @apply flex items-center gap-1 flex-wrap;
}
</style>
