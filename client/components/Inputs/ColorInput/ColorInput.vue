<script setup lang="ts">
// Types
import type { IColorProps } from './types/color-props.type'

// Functions
import { useFieldUtils } from '../../Field/functions/useFieldUtils'
import { getComponentMergedProps, getComponentProps } from '../../../functions/get-component-props'

const props = withDefaults(defineProps<IColorProps>(), {
  ...getComponentProps('colorInput'),
})

defineEmits<{
  (e: 'update:modelValue', val?: string | undefined | null): void
  (e: 'focus'): void
  (e: 'blur', ev: FocusEvent): void
}>()
// Utils
const onFocus = props.eventHandlers?.onFocus
const onBeforeFocus = props.eventHandlers?.onBeforeFocus

const mergedProps = computed(() => {
  return getComponentMergedProps('colorInput', props)
})

// Layout
const fieldEl = useTemplateRef('fieldEl')
const referenceEl = ref<HTMLDivElement>()
const model = defineModel<string>()
const isPickerActive = ref(false)

const modelLabel = computed(() => {
  if (!model.value) {
    return ''
  }

  const label = $t(`color.${model.value}`)

  return label === `color.${model.value}` ? model.value : label
})

function handlePickColor(color?: string) {
  model.value = color
}

// Field
const { el, getFieldProps, handleFocusOrClick } = useFieldUtils({
  props,
  onBeforeFocus: ev => onBeforeFocus?.(ev, isPickerActive) ?? {},
  onFocus: ev => onFocus ? onFocus(ev, isPickerActive) : isPickerActive.value = true,
})

const fieldProps = getFieldProps(props)

// Lifcecycle
onMounted(() => {
  referenceEl.value = unrefElement(fieldEl as any)?.querySelector(
    '.wrapper__body',
  ) as HTMLDivElement
})
</script>

<template>
  <Field
    ref="fieldEl"
    v-bind="fieldProps"
    :ui="mergedProps.ui"
    :has-content="!!model"
    .focus="handleFocusOrClick"
    @focus="handleFocusOrClick"
    @click="handleFocusOrClick"
  >
    <template #prepend>
      <div
        class="w-6 h-6 rounded-custom border-1 border-ca m-l-2"
        :style="{ backgroundColor: model }"
        data-cy="color-picker-preview"
      />
    </template>

    <span ref="el">
      {{ modelLabel }}
    </span>

    <MenuProxy
      v-model="isPickerActive"
      manual
      tabindex="-1"
      :fit="false"
      placement="bottom-start"
      :reference-target="referenceEl"
      no-uplift
    >
      <ColorBrandingPicker
        v-model="model"
        :rgba
        :disallowed-colors
        @update:model-value="handlePickColor"
      />
    </MenuProxy>

    <template
      v-if="!noIcon"
      #append
    >
      <div
        :class="icon"
        m="x-2"
        tabindex="-1"
        cursor="pointer"
      />
    </template>
  </Field>
</template>
