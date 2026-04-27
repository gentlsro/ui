<script setup lang="ts">
// Types
import type { IColorInputProps } from './types/color-props.type'

// Functions
import { useInputUtils } from '../functions/useInputUtils'
import { useColors } from '../../../../shared/composables/useColors'
import { useInputValidationUtils } from '../functions/useInputValidationUtils'

// Constants
import { INPUT_WRAPPER_DEFAULT_PROPS } from '../../InputWrapper/constants/input-wrapper-default-props'

const props = withDefaults(defineProps<IColorInputProps>(), {
  ...getComponentProps('colorInput'),
})

defineEmits<{
  (e: 'update:modelValue', val?: string | undefined | null): void
  (e: 'focus'): void
  (e: 'blur', ev: FocusEvent): void
}>()

// Utils
const { getColor, rgbaToHex, isRgba, isHex, getTwNameFromHex } = useColors()

const mergedProps = computed(() => {
  return getComponentMergedProps('colorInput', props)
})

// Layout
const wrapperEl = useTemplateRef('wrapperEl')
const menuProxyEl = useTemplateRef('menuProxyEl')
const referenceEl = ref<HTMLDivElement>()
const isPickerActive = ref(false)
const size = toRef(props, 'size')
const readonly = toRef(props, 'readonly')

const colorSelected = computed(() => {
  if (!model.value) {
    return undefined
  }

  const _isHex = isHex(model.value)

  if (_isHex) {
    return model.value
  }

  const _isRgba = isRgba(model.value)

  if (_isRgba) {
    return rgbaToHex(model.value)
  }

  return getColor(model.value.replace(/-/g, '.'), undefined, true)
})

const colorSelectedTw = computed(() => {
  if (!model.value) {
    return undefined
  }

  return getTwNameFromHex(model.value)
})

/** `palette-scale` as in Tailwind / Uno (e.g. `blue-600`, `rose-DEFAULT`) */
const TW_LIKE_COLOR_TOKEN = /^[a-z][a-z0-9]*-(?:\d{1,3}|DEFAULT)$/i

function handleInputBlur(ev: FocusEvent) {
  if (!props.transformTw || typeof model.value !== 'string') {
    handleBlur(ev)

    return
  }

  const raw = model.value.trim()

  if (!raw || isHex(raw) || isRgba(raw) || !TW_LIKE_COLOR_TOKEN.test(raw)) {
    handleBlur(ev)

    return
  }

  const transformedColor = getColor(raw.replace(/-/g, '.'), undefined, true)

  if (transformedColor) {
    model.value = transformedColor
  }

  nextTick(() => handleBlur(ev))
}

function handlePickColor(color?: string) {
  originalModel.value = color

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
  originalModel,
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

// Styles - append
const appendClass = computed(() => {
  return mergedProps.value.ui?.appendClass?.({
    defaults: INPUT_WRAPPER_DEFAULT_PROPS.ui.appendClass(),
  })
})

// Styles - append
const appendStyle = computed(() => {
  return mergedProps.value.ui?.appendStyle?.()
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
        :style="{ backgroundColor: colorSelected }"
        data-cy="color-picker-preview"
      />
    </template>

    <template #default="{ inputClass, inputStyle }">
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
        :class="inputClass"
        :style="inputStyle"
        v-bind="inputProps"
        @focus="handleFocusOrClick"
        @blur="handleInputBlur"
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
        <ColorPicker
          v-model="model"
          :rgba
          :tw
          :disallowed-colors
          @update:model-value="handlePickColor"
        />
      </MenuProxy>
    </template>

    <!-- Append -->
    <template
      v-if="$slots.append || hasClearableBtn"
      #append
    >
      <span
        v-if="colorSelectedTw"
        class="font-rem-11 text-caption"
      >
        {{ colorSelectedTw }}
      </span>

      <div
        :class="appendClass"
        :style="appendStyle"
      >
        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />

        <InputClearBtn
          v-if="hasClearableBtn"
          :clear-confirmation
          :size
          @click.stop.prevent="!clearConfirmation && clear()"
        />
      </div>
    </template>
  </InputWrapper>
</template>
