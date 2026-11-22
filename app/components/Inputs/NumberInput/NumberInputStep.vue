<script setup lang="ts">
// Types
import type { INumberInputProps } from './types/number-input-props.type'

const props = defineProps<INumberInputProps>()

// Layout
const model = defineModel<INumberInputProps['modelValue']>()
const increment = useTemplateRef('increment')
const decrement = useTemplateRef('decrement')
const modifier = ref<-1 | 1>(1)

const stepAdjusted = computed(() => {
  if (!model.value) {
    return typeof props.step === 'number' ? props.step : 1
  }

  if (props.step !== 'auto') {
    return props.step || 0
  }

  if (+model.value <= 200) {
    return 1
  } else if (+model.value <= 20000) {
    return 100
  } else {
    return 1000
  }
})

const { pause, resume } = useIntervalFn(() => handleStep(), 120, {
  immediate: false,
  immediateCallback: true,
})

function handleStep() {
  let currentValue = model.value

  if (
    isNil(currentValue)
    || Number.isNaN(+currentValue)
    || currentValue === ''
    || currentValue === props.emptyValue
  ) {
    currentValue = 0
  }

  const nextValue = +currentValue! + stepAdjusted.value * modifier.value

  // Round to avoid floating point precision issues with decimal steps
  const stepDecimalPlaces = stepAdjusted.value.toString().split('.')[1]?.length ?? 0
  const precision = 10 ** stepDecimalPlaces
  model.value = Math.round(nextValue * precision) / precision
}

function startStep(_: PointerEvent, increment = true) {
  modifier.value = increment ? 1 : -1

  window.addEventListener('pointerup', stopStep)
  window.addEventListener('mouseup', stopStep)
  window.addEventListener('touchend', stopStep)
  window.addEventListener('touchmove', stopStep)
  window.addEventListener('touchcancel', stopStep)
  resume()
}

function stopStep() {
  pause()
  window.removeEventListener('pointerup', stopStep)
  window.removeEventListener('mouseup', stopStep)
  window.removeEventListener('touchend', stopStep)
  window.removeEventListener('touchmove', stopStep)
  window.removeEventListener('touchcancel', stopStep)
}
</script>

<template>
  <!-- (on a touch screen the step is − and + side by side, each a finger wide: a media query, so the server's HTML matches) -->
  <div
    class="number-input__step"
    :class="`is--${size}`"
  >
    <Btn
      ref="increment"
      tabindex="-1"
      size="auto"
      color="ca"
      no-hover-effect
      touch-none
      class="number-input__step-btn is--increment"
      data-testid="number-input-increment"
      @pointerdown="startStep($event, true)"
      @mousedown.stop.prevent
      @click.stop.prevent
    >
      <template #icon>
        <div class="btn-icon step-icon step-icon--caret i-bi:caret-up-fill" />
        <div class="btn-icon step-icon step-icon--touch i-bi:plus-lg" />
      </template>
    </Btn>
    <Btn
      ref="decrement"
      tabindex="-1"
      size="auto"
      color="ca"
      no-hover-effect
      touch-none
      class="number-input__step-btn is--decrement"
      data-testid="number-input-decrement"
      @pointerdown="startStep($event, false)"
      @mousedown.stop.prevent
      @click.stop.prevent
    >
      <template #icon>
        <div class="btn-icon step-icon step-icon--caret i-bi:caret-up-fill rotate-180" />
        <div class="btn-icon step-icon step-icon--touch i-bi:dash-lg" />
      </template>
    </Btn>
  </div>
</template>

<style lang="scss" scoped>
.number-input__step {
  @apply flex flex-col shrink w-4;
}

.step-icon--touch {
  display: none;
}

.is--xs {
  :deep(.step-icon) {
    @apply w-2.5 h-2.5;
  }
}

.is--sm {
  :deep(.step-icon) {
    @apply w-3 h-3;
  }
}

.is--md,
.is--lg {
  :deep(.step-icon) {
    @apply w-4 h-4;
  }
}

// A touch screen: − then +, each 44 px wide and the field's height, at the end of the field
@media (pointer: coarse) {
  .number-input__step {
    @apply flex-row-reverse self-stretch w-auto shrink-0;
  }

  .number-input__step-btn {
    @apply w-11 h-auto self-stretch rounded-0 border-l-1 border-ca;
  }

  .step-icon--caret {
    display: none;
  }

  .step-icon--touch {
    display: block;
  }

  // (the same size on every field: a finger target, not a caret)
  .number-input__step :deep(.step-icon) {
    @apply w-4 h-4;
  }
}
</style>

<style lang="scss">
// (on a touch screen the field's end area that holds the step takes the field's height, so − and + do too)
@media (pointer: coarse) {
  // (a selector, not :where: it outweighs the container's own padding utility)
  div:has(> .number-input__step) {
    align-self: stretch;
    padding-right: 0;
  }
}
</style>
