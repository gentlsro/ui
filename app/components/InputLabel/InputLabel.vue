<script setup lang="ts">
// Types
import type { IInputLabelProps } from './types/input-label-props.type'

// Constants
import { INPUT_LABEL_DEFAULT_PROPS } from './constants/input-label-default-props'
import { $bp } from '../../constants/breakpoints'

const props = withDefaults(defineProps<IInputLabelProps>(), {
  ...getComponentProps('inputLabel'),
})

// Utils
const self = getCurrentInstance()

const mergedProps = computed(() => {
  return getComponentMergedProps('inputLabel', props)
})

// Layout
// Adjustment of label position when we use `prepend` slot
const prependWidth = ref(0)
const isMounted = ref(false)

const label = computed(() => {
  if (typeof props.label === 'function') {
    return props.label()
  }

  return props.label
})

// Label hint
const isLabelHintTooltipOpen = shallowRef(false)
const labelHintEl = useTemplateRef<HTMLElement>('labelHintEl')
const labelHintTooltipId = useId()
const isMobileLabelHint = $bp.smaller('md')

const labelHint = computed(() => mergedProps.value.labelHint)

const hasLabelHint = computed(() => {
  return Boolean(labelHint.value?.label)
})

const isLabelHintTooltipManual = computed(() => {
  return Boolean(labelHint.value?.props?.manual)
})

const labelHintTooltipProps = computed(() => ({
  placement: isMobileLabelHint.value ? 'bottom-end' : 'right',
  ...labelHint.value?.props,
}))

function setLabelHintTooltipOpen(open: boolean) {
  isLabelHintTooltipOpen.value = open
}

function handleLabelHintMouseEnter() {
  if (isLabelHintTooltipManual.value) {
    setLabelHintTooltipOpen(true)
  }
}

function handleLabelHintMouseLeave() {
  if (!isLabelHintTooltipManual.value) {
    return
  }

  const stillHasFocus = labelHintEl.value?.contains(document.activeElement)

  if (!stillHasFocus) {
    setLabelHintTooltipOpen(false)
  }
}

onClickOutside(labelHintEl, () => setLabelHintTooltipOpen(false))

// Styles - Label
const labelClassLocal = computed(() => {
  const isInline = props.layout === 'inline'
  const isInside = props.layout === 'label-inside'
  const isRegular = props.layout === 'regular'

  return [
    `label--${props.size}`,
    {
      'is-inline': isInline,
      'is-required': props.required,
      'is-inside': isInside,
      'is-regular': isRegular,
      'is-floating': !isInline && (props.stackLabel || props.placeholder || props.hasContent),
      'is-mounted': isMounted.value,
      'is-focusable': props.ui?.focusInputOnLabelClick,
      'has-hint': hasLabelHint.value,
      'is-mobile-hint': hasLabelHint.value && isMobileLabelHint.value,
    },
  ]
})

const labelClass = computed(() => {
  return mergedProps.value.ui?.labelClass?.({
    defaults: INPUT_LABEL_DEFAULT_PROPS.ui.labelClass(),
  })
})

const labelStyle = computed(() => {
  let labelStyle: IItem | undefined

  if (props.ui?.labelStyleObj) {
    labelStyle = {
      ...props.ui.labelStyleObj,
      ...props.ui.labelStyle?.(),
    }
  } else {
    labelStyle = mergedProps.value.ui?.labelStyle?.()
  }

  return {
    '--activeColor': props.activeLabelColor,
    '--prependWidth': `${-1 * prependWidth.value}px`,
    '--labelInlineWidth': props.ui?.labelInlineWidth ?? '200px',
    ...labelStyle,
  }
})

onMounted(() => {
  nextTick(() => {
    const prepend = self?.vnode.el?.parentNode.parentNode.querySelector('.input-wrapper__regular-prepend')
    prependWidth.value = prepend?.clientWidth ?? 0

    nextTick(() => {
      isMounted.value = true
    })
  })
})
</script>

<template>
  <label
    :for="id"
    class="label"
    :class="[labelClassLocal, labelClass]"
    :style="labelStyle"
  >
    <span class="label__content">
      <span class="label__text">
        {{ label }}
      </span>

      <!-- Label hint -->
      <span
        v-if="hasLabelHint"
        ref="labelHintEl"
        class="label__hint"
        role="button"
        tabindex="0"
        :aria-label="labelHint?.label"
        :aria-describedby="isLabelHintTooltipOpen ? labelHintTooltipId : undefined"
        @click.stop.prevent="setLabelHintTooltipOpen(true)"
        @focus="setLabelHintTooltipOpen(true)"
        @blur="setLabelHintTooltipOpen(false)"
        @mouseenter="handleLabelHintMouseEnter"
        @mouseleave="handleLabelHintMouseLeave"
        @keydown.enter.space.stop.prevent="setLabelHintTooltipOpen(true)"
        @keydown.esc.stop.prevent="setLabelHintTooltipOpen(false)"
      >
        <span
          class="label__hint-icon"
          :class="labelHint?.icon"
        />

        <Tooltip
          v-if="labelHint?.label"
          :id="labelHintTooltipId"
          v-model="isLabelHintTooltipOpen"
          :offset="8"
          :content="{ title: labelHint?.label }"
          v-bind="labelHintTooltipProps"
        />
      </span>
    </span>

    <slot />
  </label>
</template>

<style lang="scss" scoped>
label.label {
  @apply block ease-linear tracking-wide origin-top-left top-0 left-0
    leading-tight max-w-full p-x-3 break-words cursor-text;

  // @apply z-10; // Is this needed? It fucks up a lot of things...

  .label__content {
    @apply flex items-start gap-0.5 w-full max-w-full;
  }

  .label__text {
    @apply truncate;
  }

  .label__hint {
    @apply relative inline-flex flex-none items-start pointer-events-auto
      cursor-help top--2px;
  }

  &.is-mobile-hint .label__hint {
    @apply cursor-pointer p-1 m--1;
  }

  .label__hint-icon {
    @apply w-3 h-3 color-blue-300;
  }

  // Layout ~ Inline
  &.is-inline {
    @apply order--1 font-rem-13;

    @screen md {
      @apply text-right font-rem-14 p-y-0.5 p-x-0;

      width: var(--labelInlineWidth);
      min-width: var(--labelInlineWidth);
      max-width: var(--labelInlineWidth);

      .label__content {
        @apply justify-end;
      }
    }

    &:not(.is-focusable) {
      @apply pointer-events-none;
    }
  }

  // Layout ~ Regular
  &.is-regular {
    @apply absolute;
  }

  // Layout ~ not Inline
  &:not(.is-inline) {
    @apply origin-top-left left-0 top-0 truncate w-full overflow-hidden;
  }

  &.has-hint:not(.is-inline) {
    overflow: visible;
  }

  &.is-inside {
    @apply absolute;

    .label__hint {
      @apply top--8px;
    }
  }

  // Size: Small
  &--sm {
    @apply font-rem-14;

    &.is-inside {
      @apply translate-y-11px;
    }

    &.is-regular {
      @apply translate-y-23.5px;
    }

    &.is-inline {
      @apply font-rem-12;
    }
  }

  // Size: Medium
  &--md {
    // @apply leading-4;

    &.is-inside {
      @apply translate-y-11.5px;
    }

    &.is-regular {
      @apply translate-y-26px;
    }
  }

  // Size: Large
  &--lg {
    @apply font-rem-16;

    &.is-inside {
      @apply translate-y-16.5px;
    }

    &.is-regular {
      @apply translate-y-30px;
    }
  }

  &.is-floating:not(.is-inline) {
    @apply font-rem-12;
  }

  &.is-floating.is-inside {
    @apply translate-y-3px rounded-t-custom;
  }

  &.is-floating.is-regular {
    @apply translate-y--1px;
  }

  &.is-required .label__text::after {
    content: ' *';
    @apply color-negative;
  }
}

.wrapper__body:not(.selector-wrapper):focus-within > div {
  > label.label {
    color: var(--activeColor, var(--color-primary));

    &:not(.is-inline) {
      @apply font-rem-12;
    }

    &.is-inside {
      @apply translate-y-3px rounded-t-custom;
    }

    &.is-regular {
      @apply translate-y--1px;
    }
  }

  > label.label[haserror='true'] {
    @apply color-negative;
  }
}

label.label.is-floating:not(.is-inside) {
  @apply p-x-1;
}

label.label.is-inline {
  @screen lt-md {
    @apply p-x-1;
  }
}

.wrapper__body:not(.selector-wrapper):focus-within {
  label.label:not(.is-inside):not(.is-inline) {
    @apply p-x-1;
  }
}

.wrapper {
  label.label.is-regular {
    left: var(--prependWidth);
  }
}

// We delay the transition after mounting to prevent the label from jumping
.label.is-mounted {
  transition:
    transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    font-size 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    left 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.15s linear;
}
</style>
