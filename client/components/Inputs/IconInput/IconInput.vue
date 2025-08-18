<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { getComponentMergedProps, getComponentProps } from '$ui'
import type { NonUndefined } from 'utility-types'

// Functions
import { useInputUtils } from '../functions/useInputUtils'
import { useInputValidationUtils } from '../functions/useInputValidationUtils'

// Types
import type { IIconInputProps } from './types/icon-input-props.type'

const props = withDefaults(defineProps<IIconInputProps>(), {
  ...getComponentProps('iconInput'),
})

defineEmits<{
  (e: 'update:modelValue', val?: string | undefined | null): void
  (e: 'focus'): void
  (e: 'blur', ev: FocusEvent): void
}>()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('iconInput', props)
})

// Layout
const menuProxyEl = useTemplateRef('menuProxyEl')
const referenceEl = ref<HTMLDivElement>()
const wrapperEl = useTemplateRef('wrapperEl')

const {
  el,
  inputId,
  wrapperProps,
  hasContent,
  hasClearableBtn,
  label,
  masked,
  model,
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

// Picker
const isPickerActive = ref(false)

// Icon
const iconClassBySize = {
  sm: { width: 18, height: 18 },
  md: { width: 22, height: 22 },
  lg: { width: 26, height: 26 },
} as Record<NonUndefined<IIconInputProps['size']>, { width: number, height: number }>

const iconSize = computed(() => {
  return iconClassBySize[props.size ?? 'md']
})

// Validations
const { path } = useInputValidationUtils(props)

// Lifcecycle
onMounted(() => {
  referenceEl.value = unrefElement(wrapperEl as any)
    ?.querySelector('.input-wrapper-border') as HTMLDivElement
})

defineExpose({
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
      <div class="flex flex-center w-6 h-6 m-l-2">
        <Icon
          v-if="model"
          :icon="model"
          v-bind="iconSize"
        />

        <div
          v-else
          class="border-1 border-ca rounded-custom w-6 h-6"
        />
      </div>
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
      :reference-target="referenceEl"
      no-uplift
      placement="bottom-start"
    >
      <IconPicker
        v-model="model"
        v-model:search="model"
        no-search
        w="auto"
        :ui="mergedProps.ui"
        @update:model-value="$hide()"
      />
    </MenuProxy>

    <template #append>
      <InputClearBtn
        v-if="hasClearableBtn && model && model !== emptyValue"
        :clear-confirmation
        :size
        m="r-2"
        @click.stop.prevent="model = emptyValue"
      />
    </template>
  </InputWrapper>
</template>
