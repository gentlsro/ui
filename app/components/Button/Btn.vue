<script setup lang="ts" generic="T extends CustomPresets = Record<string, never>">
// Types
import type { CustomPresets, IBtnProps } from './types/btn-props.type'

// Functions
import { useBtnUtils } from './functions/useBtnUtils'

// Constants
import type { BUTTON_PRESET } from './constants/button-preset.constant'
import { BTN_DEFAULT_PROPS } from './constants/btn-default-props.constant'

// Components
import BtnOrNuxtLinkResolver from './BtnOrNuxtLinkResolver.vue'

// Directives
import { vRipple } from '../../directives/ripple.directive'

const props = withDefaults(defineProps<IBtnProps<T>>(), {
  ...getComponentProps('button'),
})

// Utils
const { getBtnOrNuxtLinkResolverProps } = useBtnUtils()

const btnProps = getBtnOrNuxtLinkResolverProps(props)

const mergedProps = computed(() => {
  return getComponentMergedProps('button', props)
})

// Layout
const slots = useSlots()
const component = ref<InstanceType<typeof BtnOrNuxtLinkResolver>>()

const label = computed(() => {
  if (typeof props.label === 'function') {
    return props.label()
  }

  return props.label
})

const preset = computed(() => {
  const presets = mergedProps.value.presets as ((typeof BUTTON_PRESET) & T) | undefined

  if (!presets) {
    return null
  }

  return presets[props.preset as keyof typeof presets] ?? null
})

const classes = computed(() => {
  return [
    `btn--${props.size}`,
    `breakpoint--${props.labelBreakpoint ?? 'Inf'}`,
    { 'is-stacked': props.stacked },
    { 'is-dimmed': !props.noDim },
    { 'is-round': props.round },
    { 'is-rounded': props.rounded && !props.round },
    { 'is-outlined': props.outlined },
    { 'is-bold': !props.noBold },
    { [`is-disabled is-disabled--${props.disableStyle}`]: props.disabled },
    { 'has-label': props.label || slots.label },
    { 'has-icon': props.icon || preset.value?.icon || slots.icon },
    { 'is-center': props.align === 'center' },
    { 'is-left': props.align === 'left' },
    { 'is-right': props.align === 'right' },
    { 'is-uppercase': !props.noUppercase },
    ...(preset.value?.color ? [preset.value.color] : []),
  ]
})

defineExpose({
  getElement: () => component.value,
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: BTN_DEFAULT_PROPS.ui.containerClass({
      size: props.size ?? 'md',
    }),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - icon
const iconClass = computed(() => {
  return mergedProps.value?.ui?.iconClass?.({
    defaults: BTN_DEFAULT_PROPS.ui.iconClass({
      size: props.size ?? 'md',
    }),
  })
})

const iconStyle = computed(() => {
  return mergedProps.value?.ui?.iconStyle?.()
})

// Styles - label
const labelClass = computed(() => {
  return mergedProps.value?.ui?.labelClass?.({
    defaults: BTN_DEFAULT_PROPS.ui.labelClass({
      size: props.size ?? 'md',
    }),
  })
})

const labelStyle = computed(() => {
  return {
    ...mergedProps.value?.ui?.labelStyleObj,
    ...mergedProps.value?.ui?.labelStyle?.(),
  }
})

// Styles - focus helper
const focusHelperClass = computed(() => {
  return mergedProps.value?.ui?.focusHelperClass?.({
    defaults: BTN_DEFAULT_PROPS.ui.focusHelperClass(),
  })
})

const focusHelperStyle = computed(() => {
  return mergedProps.value?.ui?.focusHelperStyle?.()
})

// Styles - loading
const loadingClass = computed(() => {
  return mergedProps.value?.ui?.loadingClass?.({
    defaults: BTN_DEFAULT_PROPS.ui.loadingClass(),
  })
})

const loadingStyle = computed(() => {
  return mergedProps.value?.ui?.loadingStyle?.()
})

// Styles - loader
const loaderClass = computed(() => {
  return mergedProps.value?.ui?.loaderClass?.({
    defaults: BTN_DEFAULT_PROPS.ui.loaderClass({
      size: props.size ?? 'md',
    }),
  })
})

const loaderStyle = computed(() => {
  return mergedProps.value?.ui?.loaderStyle?.()
})
</script>

<template>
  <BtnOrNuxtLinkResolver
    ref="component"
    v-ripple="!disabled && ripple"
    v-bind="btnProps"
    :name="name ?? (label || icon)"
    :aria-label="label ?? (name || icon)"
    class="btn group/btn"
    :class="[classes, containerClass]"
    :style="containerStyle"
  >
    <slot name="icon">
      <div
        v-if="icon || preset"
        class="btn-icon"
        :class="[icon || preset?.icon, iconClass]"
        :style="iconStyle"
      />
    </slot>

    <slot
      name="label"
      :ui="mergedProps.ui"
    >
      <div
        v-if="label"
        class="btn-label"
        :class="[labelClass, noTruncate ? 'overflow-hidden' : 'truncate']"
        :style="labelStyle"
      >
        {{ label }}
      </div>
    </slot>

    <slot />

    <!-- Tooltip -->
    <Tooltip
      v-if="tooltip || $slots.tooltip"
      :offset="8"
      v-bind="tooltip?.props"
    >
      <slot
        v-if="tooltip?.label || $slots.tooltip"
        name="tooltip"
      >
        {{ tooltip?.label }}
      </slot>
    </Tooltip>

    <!-- Loading -->
    <div
      v-if="loading"
      class="btn-loading"
      :class="loadingClass"
      :style="loadingStyle"
      @click.stop.prevent
    >
      <Loader
        :variant="loaderVariant"
        :color="loadingColor"
        class="btn-loader"
        :class="loaderClass"
        :style="loaderStyle"
      />
    </div>

    <!-- Hover focus helper -->
    <span
      v-if="!noHoverEffect"
      class="btn-focus-helper"
      :class="focusHelperClass"
      :style="focusHelperStyle"
      tabindex="-1"
    />
  </BtnOrNuxtLinkResolver>
</template>
