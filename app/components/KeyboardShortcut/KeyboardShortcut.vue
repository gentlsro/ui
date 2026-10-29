<script setup lang="ts">
// Types
import type { IKeyboardShortcutProps } from './types/keyboard-shortcut-props.type'

// Constants
import { KEYBOARD_SHORTCUT_DEFAULT_PROPS } from './constants/keyboard-shortcut-default-props.constant'

const props = withDefaults(defineProps<IKeyboardShortcutProps>(), {
  ...getComponentProps('keyboardShortcut'),
})

// Utils
const { lastPointerDownType, uiState } = storeToRefs(useUIStore())
const { isApple } = useDevice()

const mergedProps = computed(() => {
  return getComponentMergedProps('keyboardShortcut', props)
})

const hasAnyModifier = computed(() => {
  if (props.noPlus) {
    return false
  }

  return props.withCtrl || props.withAlt || props.withShift
})

const isVisible = computed(() => {
  const { keyboardShortcuts } = uiState.value.general ?? {}
  const isVisible = keyboardShortcuts || props.forceVisibility

  return lastPointerDownType.value === 'mouse' && isVisible
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: KEYBOARD_SHORTCUT_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - wrapper
const wrapperClass = computed(() => {
  return mergedProps.value?.ui?.wrapperClass?.({
    defaults: KEYBOARD_SHORTCUT_DEFAULT_PROPS.ui.wrapperClass(),
  })
})

const wrapperStyle = computed(() => {
  return mergedProps.value?.ui?.wrapperStyle?.()
})

// Styles - icon
const iconClass = computed(() => {
  return mergedProps.value?.ui?.iconClass?.({
    defaults: KEYBOARD_SHORTCUT_DEFAULT_PROPS.ui.iconClass(),
  })
})

const iconStyle = computed(() => {
  return mergedProps.value?.ui?.iconStyle?.()
})
</script>

<template>
  <div
    v-if="isVisible"
    class="keyboard-shortcut"
    :class="containerClass"
    :style="containerStyle"
  >
    <!-- Modifier - CTRL -->
    <div
      v-if="withCtrl"
      class="keyboard-shortcut__wrapper"
      :class="wrapperClass"
      :style="wrapperStyle"
    >
      <div
        v-if="isApple"
        i-ph:command
        class="icon"
        :class="iconClass"
        :style="iconStyle"
      />
      <div
        v-else
        i-fluent:control-button-20-regular
        class="icon"
        :class="iconClass"
        :style="iconStyle"
      />
    </div>

    <!-- Modifier - ALT -->
    <div
      v-if="withAlt"
      class="keyboard-shortcut__wrapper"
      :class="wrapperClass"
      :style="wrapperStyle"
    >
      <div
        v-if="isApple"
        i-ph:option
        class="icon"
        :class="iconClass"
        :style="iconStyle"
      />
      <div
        v-else
        i-tabler:alt
        class="icon"
        :class="iconClass"
        :style="iconStyle"
      />
    </div>

    <!-- Modifier - SHIFT -->
    <div
      v-if="withShift"
      class="keyboard-shortcut__wrapper"
      :class="wrapperClass"
      :style="wrapperStyle"
    >
      <div
        i-fluent:keyboard-shift-uppercase-16-filled
        class="icon !h-3 !w-3"
        :style="iconStyle"
      />
    </div>

    <div v-if="hasAnyModifier">
      +
    </div>

    <!-- Key -->
    <div
      class="keyboard-shortcut__wrapper"
      :class="wrapperClass"
      :style="wrapperStyle"
    >
      <div
        :class="icon"
        font="rem-14"
      >
        {{ char }}
      </div>
    </div>
  </div>
</template>
