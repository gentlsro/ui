<script setup lang="ts">
// Types
import type { IInputLabelProps } from './types/input-label-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

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

const labelClass = computed(() => {
  const isInline = props.layout === 'inline'
  const isInside = props.layout === 'label-inside'
  const isRegular = props.layout === 'regular'

  return [
    mergedProps.value.ui?.labelClass,
    `label--${props.size}`,
    {
      'is-inline': isInline,
      'is-required': props.required,
      'is-inside': isInside,
      'is-regular': isRegular,
      'is-floating': !isInline && (props.stackLabel || props.placeholder || props.hasContent),
      'is-mounted': isMounted.value,
    },
  ]
})

const labelStyle = computed(() => {
  return {
    '--activeColor': props.activeLabelColor,
    '--prependWidth': `${-1 * prependWidth.value}px`,
    '--labelInlineWidth': props.ui?.labelInlineWidth ?? '200px',
    ...mergedProps.value.ui?.labelStyle,
  }
})

onMounted(() => {
  const prepend = self?.vnode.el?.parentNode.parentNode.querySelector('.input-wrapper__regular-prepend')
  prependWidth.value = prepend?.clientWidth ?? 0

  nextTick(() => {
    isMounted.value = true
  })
})
</script>

<template>
  <label
    :for="id"
    class="label"
    :class="labelClass"
    :style="labelStyle"
  >
    {{ label }}
  </label>
</template>

<style lang="scss" scoped>
label.label {
  @apply block ease-linear tracking-wide z-10 origin-top-left top-0 left-0
    leading-tight max-w-full p-x-3 break-words cursor-text;

  // Layout ~ Inline
  &.is-inline {
    @apply order--1 font-rem-13;

    @screen md {
      @apply min-w-$labelInlineWidth w-$labelInlineWidth text-right font-rem-14 p-y-0.5 p-x-0;
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

  // Size: Small
  &--sm {
    @apply font-rem-14;

    &.is-inside {
      @apply translate-y-11px;
    }

    &.is-regular {
      @apply translate-y-23.5px;
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

  &.is-required::after {
    content: ' *';
    @apply color-negative;
  }
}

.wrapper__body:not(.selector-wrapper):focus-within > div {
  > label.label {
    color: var(--active-color, var(--color-primary));

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
