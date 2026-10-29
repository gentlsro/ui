<script setup lang="ts" generic="T extends CustomPresets = Record<string, never>">
// Types
import type { CSSProperties } from 'vue'
import type { CustomPresets, IBtnProps } from './types/btn-props.type'

// Functions
import { useBtnUtils } from './functions/useBtnUtils'

// Constants
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
  const presets = mergedProps.value.presets ?? {}

  return presets[props.preset as keyof typeof presets] ?? null
})

// Styled below, a container query per size
const labelBreakpointClass = computed(() => {
  const hasLabel = label.value || slots.label

  return hasLabel && props.labelBreakpoint
    ? `label-breakpoint--${props.labelBreakpoint}`
    : undefined
})

const classes = computed(() => {
  return [
    `btn--${props.size}`,
    labelBreakpointClass.value,
    { 'is-stacked': props.stacked },
    { 'is-dimmed': !props.noDim },
    { 'is-round': props.round },
    { 'is-rounded': props.rounded && !props.round },
    { 'is-outlined': props.outlined },
    { 'is-bold': !props.noBold },
    { [`is-disabled is-disabled--${props.disableStyle}`]: props.disabled },
    { 'has-label': label.value || slots.label },
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
  return mergedProps.value?.ui?.containerClass?.(withClassPicker({
    defaults: BTN_DEFAULT_PROPS.ui.containerClass({
      align: props.align,
      noUppercase: props.noUppercase,
      noBold: props.noBold,
      noDim: props.noDim,
      round: props.round,
      rounded: props.rounded,
      outlined: props.outlined,
      stacked: props.stacked,
      disabled: props.disabled,
      disableStyle: props.disableStyle,
      hasLabel: !!(label.value || slots.label),
      size: props.size ?? 'md',
    }),
  }))
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - icon
const iconClass = computed(() => {
  return mergedProps.value?.ui?.iconClass?.(withClassPicker({
    defaults: BTN_DEFAULT_PROPS.ui.iconClass({
      size: props.size ?? 'md',
    }),
  }))
})

const iconStyle = computed(() => {
  return mergedProps.value?.ui?.iconStyle?.()
})

// Styles - label
const labelClass = computed(() => {
  return mergedProps.value?.ui?.labelClass?.(withClassPicker({
    defaults: BTN_DEFAULT_PROPS.ui.labelClass({
      align: props.align,
      size: props.size ?? 'md',
    }),
  }))
})

const labelStyle = computed(() => {
  return {
    ...mergedProps.value?.ui?.labelStyleObj,
    ...mergedProps.value?.ui?.labelStyle?.(),
  }
})

// Styles - focus helper
const focusHelperClass = computed(() => {
  return mergedProps.value?.ui?.focusHelperClass?.(withClassPicker({
    defaults: BTN_DEFAULT_PROPS.ui.focusHelperClass(),
  }))
})

// The helper inherits the button's outer border radius, so it must cover the
// border box too; `inset-0` would place it inside the border where that radius
// is too large and leaves gaps in the corners. CSS cannot read the border width
// (it often comes from consumer classes), so measure it once after mount.
const focusHelperInset = ref<CSSProperties>()

function syncFocusHelperInset() {
  const el = component.value?.$el as HTMLElement | undefined

  if (props.noHoverEffect || !(el instanceof HTMLElement)) {
    return
  }

  const style = getComputedStyle(el)

  focusHelperInset.value = {
    top: `-${style.borderTopWidth}`,
    right: `-${style.borderRightWidth}`,
    bottom: `-${style.borderBottomWidth}`,
    left: `-${style.borderLeftWidth}`,
  }
}

onMounted(() => {
  nextTick(syncFocusHelperInset)
})

const focusHelperStyle = computed(() => {
  return [focusHelperInset.value, mergedProps.value?.ui?.focusHelperStyle?.()]
})

// Styles - loading
const loadingClass = computed(() => {
  return mergedProps.value?.ui?.loadingClass?.(withClassPicker({
    defaults: BTN_DEFAULT_PROPS.ui.loadingClass(),
  }))
})

const loadingStyle = computed(() => {
  return mergedProps.value?.ui?.loadingStyle?.()
})

// Styles - loader
const loaderClass = computed(() => {
  return mergedProps.value?.ui?.loaderClass?.(withClassPicker({
    defaults: BTN_DEFAULT_PROPS.ui.loaderClass({
      size: props.size ?? 'md',
    }),
  }))
})

const loaderStyle = computed(() => {
  return mergedProps.value?.ui?.loaderStyle?.()
})

const loaderSize = computed(() => {
  const size = props.size ?? 'md'

  return BTN_DEFAULT_PROPS.ui.loaderClass({ size }).sizes[size] || undefined
})

const iconValue = computed(() => {
  return props.icon || preset.value?.icon
})

const [DefineLabel, UseLabel] = createReusableTemplate()

const resolvedIcon = computed(() => {
  // Preset icons historically render as classes; canonical names still opt into Icon.
  return resolveIconValue(props.icon || [preset.value?.icon])
})
</script>

<template>
  <BtnOrNuxtLinkResolver
    ref="component"
    v-ripple="!disabled && ripple"
    v-bind="btnProps"
    :name="name ?? (label || icon)"
    :aria-label="label || name || (slots.label ? undefined : iconValue)"
    class="btn group/btn"
    :class="[classes, containerClass]"
    :style="containerStyle"
  >
    <slot name="icon">
      <Icon
        v-if="resolvedIcon.name"
        :name="resolvedIcon.name"
        class="btn-icon"
        :class="[resolvedIcon.classes, iconClass]"
        :style="iconStyle"
      />

      <div
        v-else-if="iconValue"
        class="btn-icon"
        :class="[resolvedIcon.classes, iconClass]"
        :style="iconStyle"
      />
    </slot>

    <DefineLabel>
      <slot
        name="label"
        :ui="mergedProps.ui"
        :style="labelStyle"
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
    </DefineLabel>

    <!-- Hidden below `labelBreakpoint`; `contents` keeps the label a direct flex item -->
    <span
      v-if="labelBreakpointClass"
      class="btn__label-breakpoint"
    >
      <UseLabel />
    </span>

    <UseLabel v-else />

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
        :size="loaderSize"
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

<style lang="scss">
// The UnoCSS container sizes, so a label goes where the container's `@…:` classes switch
$label-breakpoints: (
  'xs': 20rem,
  'sm': 24rem,
  'md': 28rem,
  'lg': 32rem,
  'xl': 36rem,
  '2xl': 42rem,
  '3xl': 48rem,
  '4xl': 56rem,
  '5xl': 64rem,
  '6xl': 72rem,
  '7xl': 80rem,
);

.btn__label-breakpoint {
  display: contents;
}

// Without a container around the button, no query matches and the label shows
@each $name, $width in $label-breakpoints {
  @container (width < #{$width}) {
    .btn.label-breakpoint--#{$name} {
      padding-inline: 0 !important;

      .btn__label-breakpoint {
        display: none;
      }
    }
  }
}
</style>
