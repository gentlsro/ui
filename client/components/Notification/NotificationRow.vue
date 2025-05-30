<script setup lang="ts">
// Types
import type { INotificationRowProps } from './types/notification-row-props.type'

// Functions
import { getComponentProps } from '../../functions/get-component-props'

const props = withDefaults(defineProps<INotificationRowProps>(), {
  ...getComponentProps('notificationRow'),
})

const emits = defineEmits<{
  (e: 'hide'): void
}>()

const STEP = 25
const DEFAULT_TIMEOUT = 2500
const TIMEOUT = (props.notification.timeout ?? DEFAULT_TIMEOUT) / STEP

// Layout
const notificationEl = ref<HTMLDivElement>()
const isPausedByForce = ref(false)

const icon = computed(() => {
  switch (props.notification.type) {
    case 'warning':
      return 'i-fluent:warning-24-filled'
    case 'info':
      return 'i-bi:info-lg'
    case 'positive':
      return 'i-ep:success-filled'
    case 'negative':
      return 'i-octicon:x-circle-fill-24'
    default:
      return 'i-bi:info-lg'
  }
})

const subtitleArr = computed(() => {
  if (!props.notification.subtitle) {
    return null
  }

  return Array.isArray(props.notification.subtitle)
    ? props.notification.subtitle
    : [props.notification.subtitle]
})

const { reset, pause, resume, counter } = useInterval(STEP, {
  controls: true,
  immediate: !props.noClose,
  callback(count) {
    if (count >= TIMEOUT && TIMEOUT) {
      if (!notificationEl.value) {
        handleHide()

        return
      }

      const { width } = notificationEl.value!.getBoundingClientRect()
      notificationEl.value!.style.width = `${width}px`
      handleHide()
    }
  },
})

function handleResume() {
  if (!isPausedByForce.value) {
    resume()
  }
}

function handleHide() {
  isPausedByForce.value = true

  pause()
  emits('hide')
}

// Counter
const counterEl = ref<HTMLSpanElement>()

// Animations
function removeAnimation() {
  counterEl.value?.classList.remove('bounce')
  counterEl.value?.removeEventListener('animationend', removeAnimation)
}

function bounce() {
  counterEl.value?.addEventListener('animationend', removeAnimation)
  counterEl.value?.classList.add('bounce')
}

// Reset timeout on notification counter change
const notificationCounter = toRef(props.notification, 'counter')

watch(notificationCounter, async () => {
  reset()
  bounce()
})
</script>

<template>
  <div
    ref="notificationEl"
    class="notification-row"
    :class="[`is-${notification.type}`]"
    :style="{
      '--progress': `${Math.round(((TIMEOUT - counter) / TIMEOUT) * 100)}%`,
    }"
    data-cy="notification-row"
    @mouseenter="!noClose && pause()"
    @mouseleave="!noClose && handleResume()"
  >
    <slot name="before" />

    <!-- Title row -->
    <div
      flex="~ gap-x-2"
      w-full
      items-center
    >
      <!-- Icon -->
      <div
        class="shrink-0 self-start h-7 w-7 m-t-2"
        :class="notification.icon || icon"
      />

      <!-- Title -->
      <div
        p="y-2"
        grow
        overflow="auto"
        :class="{ 'font-bold tracking-wide': notification.subtitle }"
      >
        <p
          max-w="full"
          break="words"
          v-html="notification.title"
        />
      </div>

      <!-- Close button -->
      <Btn
        v-if="!noClose"
        preset="CLOSE"
        class="color-red-500 self-start"
        size="sm"
        data-cy="close-notification"
        @click="handleHide"
      />
    </div>

    <!-- Subtitle -->
    <ul
      v-if="subtitleArr"
      class="notification-subtitle"
      :class="[`is-${notification.type}`]"
    >
      <li
        v-for="(subtitle, idx) in subtitleArr"
        :key="idx"
        list="inside none"
        text="caption"
      >
        {{ subtitle }}
      </li>
    </ul>

    <Component
      :is="notification.componentBelow.component"
      v-if="notification.componentBelow"
      :notification
      v-bind="notification.componentBelow?.props"
    />

    <!-- Progress -->
    <!-- <div
      v-if="TIMEOUT"
      class="progress-wrapper"
    >
      <progress
        class="notification-row--progress"
        :value="TIMEOUT - counter"
        :max="TIMEOUT"
      />
    </div> -->

    <!-- Counter -->
    <span
      v-if="notificationCounter && notificationCounter > 1"
      ref="counterEl"
      class="counter"
    >
      {{ notificationCounter }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.notification-row {
  @apply relative bg-white dark:bg-darker relative flex flex-col rounded-custom
    w-80 md:w-100 p-4 shadow-consistent-sm shadow-ca;

  &::before {
    @apply content-empty absolute left-0 top-0 h-full w-1 rounded-l-custom bg-current;
  }

  &::after {
    @apply content-empty absolute right-0 bottom-0 w-1 rounded-r-custom bg-current;
    @apply h-$progress;
    // @apply top-1/2 translate-y--50%;
  }

  &.is-positive {
    @apply color-green-500;
  }

  &.is-negative {
    @apply color-red-500;
  }

  &.is-warning {
    @apply color-amber-500;
  }

  &.is-info {
    @apply color-info;
  }

  &.is-primary {
    @apply color-primary;
  }

  &.is-secondary {
    @apply color-secondary;
  }

  .progress-wrapper {
    @apply absolute bottom-0 left--2px w-[calc(100%+4px)]
    h-[calc(100%+4px)] rounded-3 overflow-hidden pointer-events-none;
  }

  &--progress {
    @apply left-0 bottom-0 w-full absolute h-1;
  }

  .notification-subtitle {
    @apply tracking-wide text-sm color-black dark:color-white break-words p-b-3;
  }

  .counter {
    @apply absolute z-1 rounded-2 -top-2 -right-4 p-x-1 min-w-7 bg-inherit
      color-inherit border-2 border-current text-center;
  }
}

progress::-moz-progress-bar {
  @apply bg-current;
}
progress::-webkit-progress-value {
  @apply bg-current;
}
progress {
  @apply color-current;
}

progress::-webkit-progress-bar {
  @apply bg-ca;
}
progress::-moz-progress-bar {
  @apply bg-ca;
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
    transform: scale(1.15);
  }
}
</style>
