<script setup lang="ts">
import type { InputMask } from 'imask'
import type { MaybeElementRef } from '@vueuse/core'

// Types
import type { ITextAreaInputProps } from './types/text-area-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../../functions/get-component-props'
import { useInputUtils } from '../functions/useInputUtils'
import { useInputValidationUtils } from '../functions/useInputValidationUtils'

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
const {
  el,
  inputId,
  masked,
  wrapperProps,
  hasClearableBtn,
  hasContent,
  isBlurred,
  label,
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

// Validation
const { path } = useInputValidationUtils(props)

defineExpose({
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
      :class="[ui?.inputClass, resizeClass]"
      :style="ui?.inputStyle"
      v-bind="inputProps"
      @focus="handleFocusOrClick"
      @blur="handleBlur"
    />

    <template
      v-if="$slots.append || hasClearableBtn"
      #append
    >
      <div :class="mergedProps.ui?.appendClass">
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

    <slot name="inner" />

    <template
      v-if="$slots.hint"
      #hint
    >
      <slot name="hint" />
    </template>

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
  </InputWrapper>
</template>
