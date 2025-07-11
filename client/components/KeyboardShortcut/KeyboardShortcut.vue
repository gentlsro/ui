<script setup lang="ts">
import type { CSSProperties } from 'vue'

type IProps = {
  icon?: string
  char?: string
  forceVisibility?: boolean
  withCtrl?: boolean
  withAlt?: boolean
  withShift?: boolean

  /**
   * When true, the `+` between modifier and key will not be shown
   */
  noPlus?: boolean

  /**
   * The UI adjustments
   */
  ui?: {
    wrapperClass?: ClassType
    wrapperStyle?: CSSProperties
  }
}

const props = defineProps<IProps>()

// Utils
const { lastPointerDownType, uiState } = storeToRefs(useUIStore())
const { isApple } = useDevice()

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
</script>

<template>
  <div
    v-if="isVisible"
    class="keyboard-shortcut"
  >
    <!-- Modifier - CTRL -->
    <div
      v-if="withCtrl"
      class="keyboard-shortcut__wrapper"
      :class="ui?.wrapperClass"
      :style="ui?.wrapperStyle"
    >
      <div
        v-if="isApple"
        i-ph:command
        class="icon"
      />
      <div
        v-else
        i-fluent:control-button-20-regular
        class="icon"
      />
    </div>

    <!-- Modifier - ALT -->
    <div
      v-if="withAlt"
      class="keyboard-shortcut__wrapper"
      :class="ui?.wrapperClass"
      :style="ui?.wrapperStyle"
    >
      <div
        v-if="isApple"
        i-ph:option
        class="icon"
      />
      <div
        v-else
        i-tabler:alt
        class="icon"
      />
    </div>

    <!-- Modifier - SHIFT -->
    <div
      v-if="withShift"
      class="keyboard-shortcut__wrapper"
      :class="ui?.wrapperClass"
      :style="ui?.wrapperStyle"
    >
      <div
        i-fluent:keyboard-shift-uppercase-16-filled
        class="icon !h-3 !w-3"
      />
    </div>

    <div v-if="hasAnyModifier">
      +
    </div>

    <!-- Key -->
    <div
      class="keyboard-shortcut__wrapper"
      :class="ui?.wrapperClass"
      :style="ui?.wrapperStyle"
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

<style scoped lang="scss">
.keyboard-shortcut {
  @apply flex gap-1 items-center font-mono color-ca leading-none;

  &__wrapper {
    @apply flex flex-center border-1 border-ca rounded-1 w-4.5 h-4.5
      bg-white color-darker dark:(bg-darker color-white);

    & > .icon {
      @apply h-4 w-4;
    }
  }
}
</style>
