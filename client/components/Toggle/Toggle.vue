<script setup lang="ts">
// Types
import type { IToggleProps, ToggleClass, ToggleState } from './types/toggle-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

const props = withDefaults(defineProps<IToggleProps>(), {
  ...getComponentProps('toggle'),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('toggle', props)
})

// State
const originalModel = defineModel<any>()

const model = computed({
  get() {
    // If string-like values are allowed, we need to check them against stringified values
    if (props.allowString) {
      const val = originalModel.value === null ? 'null' : originalModel.value.toString()

      const checkValueString = props.checkValue?.toString()
      const uncheckValueString = props.uncheckValue?.toString()

      if (val === checkValueString) {
        return 'checked'
      } else if (val === uncheckValueString) {
        return 'unchecked'
      }

      return 'indeterminate'
    }

    const isChecked = originalModel.value === props.checkValue
    const isUnchecked = originalModel.value === props.uncheckValue

    if (isChecked) {
      return 'checked'
    } else if (isUnchecked) {
      return 'unchecked'
    } else {
      return 'indeterminate'
    }
  },
  set(val) {
    if (val === 'checked') {
      originalModel.value = props.checkValue
    } else if (val === 'unchecked') {
      originalModel.value = props.uncheckValue
    } else {
      originalModel.value = props.indeterminateValue
    }
  },
})

function handleStateChange() {
  if (props.readonly || props.disabled) {
    return
  }

  switch (model.value) {
    case 'checked':
      model.value = 'unchecked'
      break

    case 'unchecked':
      model.value = props.allowIndeterminate ? 'indeterminate' : 'checked'
      break

    case 'indeterminate':
      model.value = 'checked'
      break
  }
}

// Layout
const toggleEl = ref<HTMLDivElement>()

function handleFocus() {
  toggleEl.value?.focus()
}
const classes = computed(() => {
  return {
    toggle: [
      mergedProps.value.ui?.toggleClass?.(model.value),
      `toggle--${props.size}`,
      `is-${model.value}`,
      {
        'is-hoverable': props.hoverable,
        'is-readonly': props.readonly,
        'is-disabled': props.disabled,
      },
    ],
    bullet: [
      mergedProps.value.ui?.bulletClass?.(model.value),
      { 'is-contained': props.contained },
    ],
  }
})

const styles = computed(() => {
  return {
    toggle: mergedProps.value.ui?.toggleStyle?.(model.value),
    bullet: mergedProps.value.ui?.bulletStyle?.(model.value),
  }
})

// Keyboard navigation
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault?.()

    handleStateChange()
  }
}
</script>

<template>
  <Item
    v-bind="itemProps"
    :readonly
    :disabled
    .focus="handleFocus"
    @click="handleStateChange"
  >
    <slot name="prepend" />

    <div
      ref="toggleEl"
      class="toggle"
      :class="classes.toggle"
      :style="styles.toggle"
      tabindex="0"
      @keydown="handleKeyDown"
    >
      <div
        class="bullet"
        :class="classes.bullet"
        :style="styles.bullet"
      >
        <slot name="bullet">
          <div
            v-if="mergedProps?.ui?.icon?.(model)"
            :class="mergedProps?.ui?.icon?.(model)"
          />
        </slot>
      </div>
    </div>

    <slot v-if="label">
      <div
        class="toggle-label"
        p="r-3"
        :class="[mergedProps.ui?.labelClass, `toggle-label--${size}`]"
        :style="mergedProps.ui?.labelStyle"
      >
        {{ label }}
      </div>
    </slot>

    <slot name="append" />
  </Item>
</template>

<style lang="scss" scoped>
.toggle {
  -webkit-tap-highlight-color: transparent;
  @apply flex items-center cursor-pointer select-none relative shrink-0;

  &.is-readonly {
    @apply border-dotted cursor-default;

    &.is-checked .bullet {
      @apply bg-positive/50 border-2 border-dotted border-positive;
    }

    &.is-unchecked .bullet {
      @apply bg-negative/50 border-2 border-dotted border-negative;
    }
  }

  &-label--xs,
  &-label--sm {
    @apply text-sm;
  }

  &.is-disabled {
    @apply cursor-not-allowed disabled;
  }

  &--xs {
    @apply w-8 h-4.5 m-y-0.75 m-l-1 m-r-1.5;

    &.is-contained {
      @apply m-x-1.5;
    }

    .bullet {
      @apply h-5 w-5;

      &.is-contained {
        @apply h-3.5 w-3.5;
      }
    }
  }

  &--sm {
    @apply w-9.5 h-5.5 m-y-0.5 m-l-1 m-r-1.5;

    &.is-contained {
      @apply m-x-1.5;
    }

    .bullet {
      @apply h-6 w-6;

      &.is-contained {
        @apply h-4.5 w-4.5;
      }
    }
  }

  &--md {
    @apply w-11 h-6 m-y-1 m-l-3.5 m-r-2;

    &.is-contained {
      @apply m-l-2.5 m-r-2;
    }

    .bullet {
      @apply h-7 w-7;

      &.is-contained {
        @apply h-5 w-5;
      }
    }
  }

  &--lg {
    @apply w-12 h-7 m-y-1.5 m-l-3.5 m-r-2;

    &.is-contained {
      @apply m-l-2.5 m-r-2;
    }

    .bullet {
      @apply h-8 w-8;

      &.is-contained {
        @apply h-5.5 w-5.5;
      }
    }
  }

  &.is-hoverable:hover {
    .bullet {
      @apply shadow-consistent-xs-fill shadow-ca;
    }
  }

  .bullet {
    @apply relative ease-linear flex flex-center;
    transition:
      transform 0.25s,
      box-shadow 0.15s;
  }

  &.is-unchecked {
    .bullet {
      @apply translate-x--8px;
    }

    .bullet.is-contained {
      @apply translate-x-2px;
    }
  }

  &.is-checked {
    &.toggle--xs {
      .bullet {
        @apply translate-x-14px;
      }
    }

    &.toggle--sm {
      .bullet {
        @apply translate-x-16px;
      }
    }

    &.toggle--md {
      .bullet {
        @apply translate-x-20px;
      }
    }

    &.toggle--lg {
      .bullet {
        @apply translate-x-22px;
      }
    }
  }

  &.is-indeterminate {
    &.toggle--xs {
      .bullet {
        @apply translate-x-5px;
      }

      .bullet.is-contained {
        @apply translate-x-8px;
      }
    }

    &.toggle--sm {
      .bullet {
        @apply translate-x-6px;
      }

      .bullet.is-contained {
        @apply translate-x-9px;
      }
    }

    &.toggle--md {
      .bullet {
        @apply translate-x-7px;
      }

      .bullet.is-contained {
        @apply translate-x-11px;
      }
    }

    &.toggle--lg {
      .bullet {
        @apply translate-x-7px;
      }

      .bullet.is-contained {
        @apply translate-x-12px;
      }
    }
  }
}
</style>
