<script setup lang="ts">
import type { InputMask } from 'imask'
import type { MaybeElementRef } from '@vueuse/core'

// Types
import type { ITextAreaInputProps } from './types/text-area-props.type'

// Functions
import { useInputUtils } from '../functions/useInputUtils'
import { useInputValidationUtils } from '../functions/useInputValidationUtils'

// Constants
import { INPUT_WRAPPER_DEFAULT_PROPS } from '../../InputWrapper/constants/input-wrapper-default-props'

const props = withDefaults(defineProps<ITextAreaInputProps>(), {
  ...getComponentProps('textArea'),
})

defineEmits<{
  (e: 'blur'): void
  (e: 'focus'): void
}>()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('textArea', props)
})

// Layout
const readonly = toRef(props, 'readonly')

const {
  el,
  inputId,
  masked,
  wrapperProps,
  hasClearableBtn,
  hasContent,
  isBlurred,
  label,
  isTouched,
  focus,
  select,
  blur,
  clear,
  getInputElement,
  handleBlur,
  handleClickWrapper,
  handleFocusOrClick,
  elMask,
} = useInputUtils({
  props,
  maskRef: toRef(props, 'mask'),
})

if (props.autogrow) {
  useTextareaAutosize({
    element: el as MaybeElementRef<HTMLTextAreaElement>,
    input: masked,
  })
}

const resizeClass = computed(() => {
  return props.autogrow ? 'resize-none' : props.resize
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

// Validation
const { path } = useInputValidationUtils(props)

defineExpose({
  isTouched: () => isTouched.value,
  focus,
  select,
  blur,
  clear,
  getInputElement,
  updateMask: (fnc: (mask: InputMask<any>) => void) => {
    fnc(elMask.value as InputMask<any>)
  },
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :id="inputId"
    :has-content
    :ui="mergedProps.ui"
    .focus="focus"
    @click="handleClickWrapper"
  >
    <!-- Label -->
    <template #label="labelProps">
      <slot
        name="label"
        v-bind="labelProps"
      />
    </template>

    <!-- Prepend -->
    <template
      v-if="$slots.prepend"
      #prepend
    >
      <slot
        name="prepend"
        :clear="clear"
        :focus="focus"
      />
    </template>

    <!-- Default -->
    <template #default="{ inputClass, inputStyle }">
      <textarea
        :id="inputId"
        ref="el"
        flex="grow"
        :value="masked"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        autocomplete="off"
        :label="label || placeholder"
        :name="name || path || label || placeholder"
        class="control"
        role="presentation"
        :rows="rows"
        :class="[inputClass, resizeClass]"
        :style="inputStyle"
        v-bind="inputProps"
        @focus="handleFocusOrClick"
        @blur="handleBlur"
      />

      <slot name="inner" />

      <!-- Tooltip -->
      <Menu
        v-if="tooltip || !!$slots.tooltip"
        :model-value="!isBlurred"
        manual
        placement="right"
        :fallback-placements="['bottom']"
        :reference-target="el"
        :no-arrow="false"
        no-uplift
        v-bind="tooltipProps"
      >
        <slot name="tooltip">
          {{ tooltip }}
        </slot>
      </Menu>
    </template>

    <template
      v-if="$slots.append || hasClearableBtn"
      #append
    >
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
          class="self-start m-t-1.5"
          @click.stop.prevent="!clearConfirmation && clear()"
        />
      </div>
    </template>

    <template
      v-if="$slots.hint"
      #hint
    >
      <slot name="hint" />
    </template>

    <template #menu>
      <slot name="menu" />
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
textarea {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

textarea::-webkit-scrollbar {
  display: none;
}
</style>
