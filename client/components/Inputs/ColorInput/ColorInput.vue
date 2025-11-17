<script setup lang="ts">
// Types
import type { IColorInputProps } from './types/color-props.type'

// Functions
import { useInputUtils } from '../functions/useInputUtils'
import { useInputValidationUtils } from '../functions/useInputValidationUtils'
import { getComponentMergedProps, getComponentProps } from '../../../functions/get-component-props'

const props = withDefaults(defineProps<IColorInputProps>(), {
  ...getComponentProps('colorInput'),
})

defineEmits<{
  (e: 'update:modelValue', val?: string | undefined | null): void
  (e: 'focus'): void
  (e: 'blur', ev: FocusEvent): void
}>()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('colorInput', props)
})

// Layout
const wrapperEl = useTemplateRef('wrapperEl')
const menuProxyEl = useTemplateRef('menuProxyEl')
const referenceEl = ref<HTMLDivElement>()
const isPickerActive = ref(false)
const size = toRef(props, 'size')

function handlePickColor(color?: string) {
  model.value = color

  if (props.autoClose) {
    isPickerActive.value = false
  }
}

// Input
const {
  el,
  inputId,
  wrapperProps,
  hasContent,
  hasClearableBtn,
  label,
  masked,
  model,
  isTouched,
  handleBlur,
  handleClickWrapper,
  handleFocusOrClick,
  focus,
  select,
  blur,
  clear,
  getInputElement,
} = useInputUtils({
  props,
  maskRef: ref({ mask: /.*/ }),
  menuElRef: menuProxyEl,
})

// Validations
const { path } = useInputValidationUtils(props)

// Lifcecycle
onMounted(() => {
  referenceEl.value = unrefElement(wrapperEl as any)
    ?.querySelector('.input-wrapper-border') as HTMLDivElement
})

defineExpose({
  isTouched: () => isTouched.value,
  focus,
  select,
  blur,
  clear,
  getInputElement,
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :id="inputId"
    ref="wrapperEl"
    :has-content
    :ui="mergedProps.ui"
    .focus="focus"
    @click="handleClickWrapper"
  >
    <template #prepend>
      <div
        class="w-6 h-6 rounded-custom border-1 border-ca m-l-2"
        :style="{ backgroundColor: model }"
        data-cy="color-picker-preview"
      />
    </template>

    <input
      :id="inputId"
      ref="el"
      :value="masked"
      flex="1"
      :placeholder
      :readonly
      :disabled
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      :label="label || placeholder"
      :name="name || path || label || placeholder"
      class="control"
      role="presentation"
      :class="[ui?.inputClass]"
      :style="ui?.inputStyle"
      v-bind="inputProps"
      @focus="handleFocusOrClick"
      @blur="handleBlur"
    >

    <MenuProxy
      ref="menuProxyEl"
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

    <template #append>
      <InputClearBtn
        v-if="hasClearableBtn && model && model !== emptyValue"
        :clear-confirmation
        :size
        @click.stop.prevent="model = emptyValue"
      />

      <div
        v-if="!noIcon"
        :class="icon"
        m="x-2"
        tabindex="-1"
        cursor="pointer"
      />
    </template>
  </InputWrapper>
</template>
