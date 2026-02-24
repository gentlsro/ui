<script setup lang="ts">
// Types
import type { IBurgerProps } from './types/burger-props.type'

// Constants
import { BURGER_DEFAULT_PROPS } from './constants/burger-default-props.constant'

const props = withDefaults(defineProps<IBurgerProps>(), {
  ...getComponentProps('burger'),
})

// Layout
const model = defineModel<boolean>({ default: false })

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('burger', props)
})

const size = computed(() => props.size ?? 'md')

// Refs for model-driven animations
const pathToX = ref<SVGAnimateElement>()
const pathToBurger = ref<SVGAnimateElement>()

watch(model, isOpen => {
  nextTick(() => {
    if (isOpen) {
      pathToX.value?.beginElement()
    }
    else {
      pathToBurger.value?.beginElement()
    }
  })
}, { immediate: true })

// Styles
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: BURGER_DEFAULT_PROPS.ui.containerClass({ size: size.value }),
  })
})

const burgerClass = computed(() => {
  return mergedProps.value?.ui?.burgerClass?.({
    defaults: BURGER_DEFAULT_PROPS.ui.burgerClass({ size: size.value }),
  })
})
</script>

<template>
  <button
    name="menu"
    class="burger-wrapper"
    :class="[containerClass, `burger-wrapper--${size}`]"
    @click="model = !model"
  >
    <svg
      :class="burgerClass"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 10 10"
      stroke="currentColor"
      stroke-width=".6"
      fill="rgba(0,0,0,0)"
      stroke-linecap="round"
      style="cursor: pointer"
    >
      <path d="M2,3L5,3L8,3M2,5L8,5M2,7L5,7L8,7">
        <animate
          ref="pathToX"
          dur="0.15s"
          attributeName="d"
          values="M2,3L5,3L8,3M2,5L8,5M2,7L5,7L8,7;M3,3L5,5L7,3M5,5L5,5M3,7L5,5L7,7"
          fill="freeze"
          begin="indefinite"
        />
        <animate
          ref="pathToBurger"
          dur="0.15s"
          attributeName="d"
          values="M3,3L5,5L7,3M5,5L5,5M3,7L5,5L7,7;M2,3L5,3L8,3M2,5L8,5M2,7L5,7L8,7"
          fill="freeze"
          begin="indefinite"
        />
      </path>
    </svg>
  </button>
</template>
