<script setup lang="ts">
// Types
import type { IToggleProps } from './types/toggle-props.type'

// Constants
import { TOGGLE_DEFAULT_PROPS } from './constants/toggle-default-props.constant'

const props = withDefaults(defineProps<IToggleProps>(), {
  ...getComponentProps('toggle'),
})

defineExpose({
  focus: () => containerEl.value?.focus(),
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
const containerEl = ref<HTMLElement>()

const label = computed(() => {
  if (typeof props.label === 'function') {
    return props.label({ state: model.value })
  }

  return props.label
})

// Keyboard navigation
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault?.()
    e.stopPropagation?.()

    handleStateChange()
  }
}

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: TOGGLE_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - toggle
const toggleClass = computed(() => {
  return mergedProps.value?.ui?.toggleClass?.({
    defaults: TOGGLE_DEFAULT_PROPS.ui.toggleClass({
      size: props.size ?? 'sm',
      contained: props.contained ?? false,
    }),
  })
})

const toggleStyle = computed(() => {
  return mergedProps.value?.ui?.toggleStyle?.()
})

// Styles - bullet
const bulletClass = computed(() => {
  return mergedProps.value?.ui?.bulletClass?.({
    defaults: TOGGLE_DEFAULT_PROPS.ui.bulletClass({
      size: props.size ?? 'sm',
      contained: props.contained ?? false,
    }),
  })
})

const bulletStyle = computed(() => {
  return mergedProps.value?.ui?.bulletStyle?.()
})

// Styles - label
const labelClass = computed(() => {
  return mergedProps.value?.ui?.labelClass?.({
    defaults: TOGGLE_DEFAULT_PROPS.ui.labelClass({
      size: props.size ?? 'sm',
    }),
  })
})

const labelStyle = computed(() => {
  return mergedProps.value?.ui?.labelStyle?.()
})

// Styles - icon
const iconClass = computed(() => {
  return mergedProps.value?.ui?.iconClass?.({
    defaults: TOGGLE_DEFAULT_PROPS.ui.iconClass(),
  })
})

const iconStyle = computed(() => {
  return mergedProps.value?.ui?.iconStyle?.()
})

// Styles - focus helper
const focusHelperClass = computed(() => {
  return mergedProps.value?.ui?.focusHelperClass?.({
    defaults: TOGGLE_DEFAULT_PROPS.ui.focusHelperClass(),
  })
})

const focusHelperStyle = computed(() => {
  return mergedProps.value?.ui?.focusHelperStyle?.()
})
</script>

<template>
  <label
    ref="containerEl"
    tabindex="0"
    class="toggle__container group/toggle"
    :class="[
      `is-${model}`,
      { 'is-hoverable': !noHoverEffect, 'is-readonly': readonly, 'is-disabled': disabled },
      containerClass,
    ]"
    :style="containerStyle"
    @keydown="handleKeyDown"
    @click.stop.prevent="handleStateChange"
  >
    <slot name="prepend" />

    <div
      class="toggle"
      :class="toggleClass"
      :style="toggleStyle"
    >
      <div
        class="bullet"
        :class="bulletClass"
        :style="bulletStyle"
      >
        <slot name="bullet">
          <div
            v-if="iconClass"
            :class="iconClass"
            :style="iconStyle"
          />
        </slot>
      </div>
    </div>

    <slot v-if="label ?? $slots.default">
      <span
        class="toggle-label"
        :class="labelClass"
        :style="labelStyle"
      >
        {{ label }}
      </span>
    </slot>

    <slot name="append" />

    <!-- Hover focus helper -->
    <span
      v-if="!noHoverEffect && !disabled && !readonly"
      class="toggle-focus-helper"
      :class="focusHelperClass"
      :style="focusHelperStyle"
      tabindex="-1"
    />
  </label>
</template>

<style lang="scss" scoped>
.toggle {
  .bullet {
    transition:
      transform 0.25s,
      box-shadow 0.15s;
  }
}
</style>
