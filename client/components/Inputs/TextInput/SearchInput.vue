<script setup lang="ts">
// Types
import type { ITextInputProps } from './types/text-input-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../../functions/get-component-props'

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
const model = ref<ITextInputProps['modelValue']>(props.modelValue)

defineExpose({
  clear: (shouldFocusAfterClear?: boolean) => searchEl.value?.clear(shouldFocusAfterClear),
  focus: () => searchEl.value?.focus(),
  blur: () => searchEl.value?.blur(),
  select: () => searchEl.value?.select(),
})
</script>

<template>
  <TextInput
    ref="searchEl"
    v-model="model"
    class="control"
    name="_search"
    v-bind="$props"
    :ui="mergedProps.ui"
    :placeholder="placeholder || $t('general.search')"
    clearable
    @update:model-value="$emit('update:modelValue', $event)"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus')"
    @clear="$emit('clear')"
    @enter="$emit('enter', $event)"
  >
    <template #prepend>
      <slot name="prepend" />
      <div
        v-if="!$slots.prepend"
        i-carbon:search
        color="ca"
        m="l-2"
      />
    </template>

    <template
      v-if="$slots.append"
      #append="{ clear }"
    >
      <slot
        name="append"
        :clear
      />
    </template>
  </TextInput>
</template>
