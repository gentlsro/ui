<script setup lang="ts" vapor>
import { mergeProps } from 'vue'

// Types
import type { ISearchInputExpose } from './types/search-input-expose.type'
import type { ITextInputProps } from './types/text-input-props.type'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<ITextInputProps>(), {
  ...getComponentProps('searchInput'),
})

defineEmits<{
  (e: 'update:modelValue', val?: string | undefined | null): void
  (e: 'focus'): void
  (e: 'blur', ev: FocusEvent): void
  (e: 'enter', event: KeyboardEvent): void
  (e: 'clear'): void
}>()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('searchInput', props)
})

// Layout
const searchEl = useTemplateRef('searchEl')
const model = defineModel<ITextInputProps['modelValue']>()

defineExpose({
  clear: (shouldFocusAfterClear?: boolean) => searchEl.value?.clear(shouldFocusAfterClear),
  focus: () => searchEl.value?.focus(),
  blur: () => searchEl.value?.blur(),
  select: () => searchEl.value?.select(),
} satisfies ISearchInputExpose)
</script>

<template>
  <TextInput
    ref="searchEl"
    v-bind="mergeProps($props, $attrs)"
    v-model="model"
    class="control"
    name="_search"
    :ui="mergedProps.ui"
    :placeholder="placeholder || $t('general.search')"
    clearable
    @blur="$emit('blur', $event)"
    @focus="$emit('focus')"
    @clear="$emit('clear')"
    @enter="$emit('enter', $event)"
  >
    <template #prepend="slotProps">
      <slot
        name="prepend"
        v-bind="slotProps"
      />
      <div
        v-if="!$slots.prepend"
        i-carbon:search
        color="ca"
        m="l-2"
      />
    </template>

    <template
      v-if="$slots.append"
      #append="slotProps"
    >
      <slot
        name="append"
        v-bind="slotProps"
      />
    </template>

    <template
      v-if="$slots.tooltip"
      #tooltip
    >
      <slot name="tooltip" />
    </template>
  </TextInput>
</template>
