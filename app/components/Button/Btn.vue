<script setup lang="ts" generic="T extends CustomPresets = Record<string, never>">
// Types
import type { ObjectDirective } from 'vue'
import type { CustomPresets, IBtnProps } from './types/btn-props.type'

// Constants
import { BTN_DEFAULT_PROPS } from './constants/btn-default-props.constant'

// Components
import { NuxtLink } from '#components'

// Directives
import { vRipple } from '../../directives/ripple.directive'

const props = withDefaults(defineProps<IBtnProps<T>>(), {
  ...getComponentProps('button'),
})

const mergedProps = computed(() => {
  return getComponentMergedProps('button', props)
})

// Layout
const slots = useSlots()
const element = shallowRef<HTMLButtonElement | HTMLAnchorElement>()

// Directives receive the actual root DOM node, including NuxtLink's anchor.
// Keep NuxtLink's normal renderer so its prefetch and router behavior stay intact.
const vRoot: ObjectDirective<HTMLButtonElement | HTMLAnchorElement> = {
  mounted(el) {
    element.value = el
  },
  beforeUnmount(el) {
    if (element.value === el) {
      element.value = undefined
    }
  },
}

// Navigation belongs to the root; the content and styling are shared by both modes.
const route = useRoute()
const localePath = useLocalePath()
const nuxtApp = useNuxtApp()

const isLink = computed(() => !!props.to && !props.disabled)
const rootProps = computed(() => {
  if (!isLink.value) {
    return { type: props.type, disabled: props.disabled }
  }

  const toPath = typeof props.to === 'string' ? props.to : props.to?.path ?? ''
  const currentPath = localePath(route.path, nuxtApp.$i18n.locale.value)

  return {
    to: props.to,
    external: props.external,
    replace: props.replace,
    target: props.external || props.download ? '_blank' : props.navigateToOptions?.open?.target,
    download: props.download || undefined,
    class: {
      'router-link-active': !props.exact && toPath.startsWith(currentPath),
      'no-active': props.noActiveLink,
      'no-underline': props.noUnderline,
    },
  }
})

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
  element,
  focus: (options?: FocusOptions) => element.value?.focus(options),
  getElement: () => element.value,
})

// Resolve each visual surface through the existing component configuration API.
const appearance = computed(() => {
  const ui = mergedProps.value.ui
  const defaults = BTN_DEFAULT_PROPS.ui
  const size = props.size ?? 'md'

  return {
    containerClass: ui?.containerClass?.({
      defaults: defaults.containerClass({
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
        size,
      }),
    }),
    containerStyle: ui?.containerStyle?.(),
    iconClass: ui?.iconClass?.({ defaults: defaults.iconClass({ size }) }),
    iconStyle: ui?.iconStyle?.(),
    labelClass: ui?.labelClass?.({ defaults: defaults.labelClass({ align: props.align, size }) }),
    labelStyle: { ...ui?.labelStyleObj, ...ui?.labelStyle?.() },
    focusHelperClass: ui?.focusHelperClass?.({ defaults: defaults.focusHelperClass() }),
    focusHelperStyle: ui?.focusHelperStyle?.(),
    loadingClass: ui?.loadingClass?.({ defaults: defaults.loadingClass() }),
    loadingStyle: ui?.loadingStyle?.(),
    loaderClass: ui?.loaderClass?.({ defaults: defaults.loaderClass({ size }) }),
    loaderStyle: ui?.loaderStyle?.(),
  }
})

const isIconifyIcon = computed(() => {
  const noSpacesRegex = /^\S+$/

  return typeof props.icon === 'string'
    && noSpacesRegex.test(props.icon)
})
</script>

<template>
  <Component
    :is="isLink ? NuxtLink : 'button'"
    v-root
    v-ripple="!disabled && ripple"
    v-bind="rootProps"
    :name="name ?? (label || icon)"
    :aria-label="label ?? (name || icon)"
    class="btn group/btn"
    :class="[classes, appearance.containerClass]"
    :style="appearance.containerStyle"
  >
    <slot name="icon">
      <Icon
        v-if="icon && isIconifyIcon"
        :name="(icon as string)"
        class="btn-icon"
        :class="appearance.iconClass"
        :style="appearance.iconStyle"
      />

      <div
        v-else-if="icon || preset?.icon"
        class="btn-icon"
        :class="[icon || preset?.icon, appearance.iconClass]"
        :style="appearance.iconStyle"
      />
    </slot>

    <slot
      name="label"
      :ui="mergedProps.ui"
      :style="appearance.labelStyle"
    >
      <div
        v-if="label"
        class="btn-label"
        :class="[appearance.labelClass, noTruncate ? 'overflow-hidden' : 'truncate']"
        :style="appearance.labelStyle"
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
      :class="appearance.loadingClass"
      :style="appearance.loadingStyle"
      @click.stop.prevent
    >
      <Loader
        :variant="loaderVariant"
        :color="loadingColor"
        class="btn-loader"
        :class="appearance.loaderClass"
        :style="appearance.loaderStyle"
      />
    </div>

    <!-- Hover focus helper -->
    <span
      v-if="!noHoverEffect"
      class="btn-focus-helper"
      :class="appearance.focusHelperClass"
      :style="appearance.focusHelperStyle"
      tabindex="-1"
    />
  </Component>
</template>

<style lang="scss" scoped>
a.btn:not(.no-underline):hover {
  @apply underline;
}

.no-active {
  @apply color-black dark:color-white;
}
</style>
