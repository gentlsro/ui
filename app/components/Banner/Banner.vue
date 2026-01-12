<script setup lang="ts">
// Parent component should handle `dismiss` event and remove Banner from the DOM

// Types
import type { IBannerProps } from './types/banner-props.type'

// Constants
import { BANNER_DEFAULT_PROPS } from './constants/banner-default-props.constant'

const props = withDefaults(defineProps<IBannerProps>(), {
  ...getComponentProps('banner'),
})

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'dismiss'): void
}>()

defineExpose({ dismiss })

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('banner', props)
})

// Layout
const counter = toRef(props, 'counter')
const model = defineModel<boolean>({ default: true })

const classes = computed(() => {
  return [
    `banner--${props.variant ?? 'none'}`,
    {
      'is-outlined': props.outlined,
      'is-dismissable': props.dismissable,
      'is-icon-center': props.iconCenter,
    },
  ]
})

function dismiss() {
  if (props.dismissable) {
    model.value = false
  }
}

// Counter
const counterEl = useTemplateRef('counterEl')

function bounce() {
  const _counterEl = unref(counterEl) as unknown as HTMLElement

  _counterEl?.addEventListener('animationend', () => {
    _counterEl.classList.remove('bounce')
  })
  _counterEl?.classList.add('bounce')
}

watch(counter, bounce)

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: BANNER_DEFAULT_PROPS.ui.containerClass({
      variant: props.variant ?? 'none',
      outlined: props.outlined ?? false,
    }),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - icon
const iconClass = computed(() => {
  return mergedProps.value?.ui?.iconClass?.({
    defaults: BANNER_DEFAULT_PROPS.ui.iconClass({
      variant: props.variant ?? 'none',
    }),
  })
})

const iconStyle = computed(() => {
  return mergedProps.value?.ui?.iconStyle?.()
})

// Styles - label
const labelClass = computed(() => {
  return mergedProps.value?.ui?.labelClass?.({
    defaults: BANNER_DEFAULT_PROPS.ui.labelClass(),
  })
})

const labelStyle = computed(() => {
  return mergedProps.value?.ui?.labelStyle?.()
})

// Styles - badge
const badgeClass = computed(() => {
  return mergedProps.value?.ui?.badgeClass?.({
    defaults: BANNER_DEFAULT_PROPS.ui.badgeClass({
      variant: props.variant ?? 'none',
    }),
  })
})

const badgeStyle = computed(() => {
  return mergedProps.value?.ui?.badgeStyle?.()
})
</script>

<template>
  <Transition
    appear
    :css="!noTransition"
    @after-leave="$emit('dismiss')"
  >
    <div
      v-if="model"
      class="banner group"
      :class="[classes, containerClass]"
      :style="containerStyle"
      @click="dismiss"
    >
      <!-- Icon -->
      <div
        :class="iconClass"
        :style="iconStyle"
      />

      <!-- Text -->
      <div
        class="banner-text"
        :class="labelClass"
        :style="labelStyle"
      >
        <slot>
          {{ label }}
        </slot>
      </div>

      <!-- Counter -->
      <Badge
        ref="counterEl"
        :counter
        :ui="{ containerClass: ({ defaults }) => '' }"
        :class="badgeClass"
        :style="badgeStyle"
      />
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
// Transition
.v-enter-active,
.v-leave-active {
  transition: all 0.25s ease;
}

.v-enter-from {
  @apply opacity-0 scale-0;
}

.v-leave-to {
  @apply opacity-0 translate-x--100%;
}

// Bounce
.bounce {
  animation: myBounce 100ms ease-in-out 0s 2 alternate forwards;
}

@keyframes myBounce {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(1.25);
  }
}
</style>
