<script setup lang="ts">
// Types
import type { INotificationRowProps } from './types/notification-row-props.type'

// Constants
import { NOTIFICATION_ROW_DEFAULT_PROPS } from './constants/notification-row-default-props.constant'

const props = withDefaults(defineProps<INotificationRowProps>(), {
  ...getComponentProps('notificationRow'),
})

const emits = defineEmits<{
  (e: 'hide'): void
}>()

// Utils
const mergedProps = computed(() => getComponentMergedProps('notificationRow', props))

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

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: NOTIFICATION_ROW_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - title row
const titleRowClass = computed(() => {
  return mergedProps.value?.ui?.titleRowClass?.({
    defaults: NOTIFICATION_ROW_DEFAULT_PROPS.ui.titleRowClass(),
  })
})

const titleRowStyle = computed(() => {
  return mergedProps.value?.ui?.titleRowStyle?.()
})

// Styles - icon
const iconClass = computed(() => {
  return mergedProps.value?.ui?.iconClass?.({
    defaults: NOTIFICATION_ROW_DEFAULT_PROPS.ui.iconClass(),
  })
})

const iconStyle = computed(() => {
  return mergedProps.value?.ui?.iconStyle?.()
})

// Styles - title
const titleClass = computed(() => {
  return mergedProps.value?.ui?.titleClass?.({
    defaults: NOTIFICATION_ROW_DEFAULT_PROPS.ui.titleClass(),
  })
})

const titleStyle = computed(() => {
  return mergedProps.value?.ui?.titleStyle?.()
})

// Styles - title text
const titleTextClass = computed(() => {
  return mergedProps.value?.ui?.titleTextClass?.({
    defaults: NOTIFICATION_ROW_DEFAULT_PROPS.ui.titleTextClass(),
  })
})

const titleTextStyle = computed(() => {
  return mergedProps.value?.ui?.titleTextStyle?.()
})

// Styles - subtitle
const subtitleClass = computed(() => {
  return mergedProps.value?.ui?.subtitleClass?.({
    defaults: NOTIFICATION_ROW_DEFAULT_PROPS.ui.subtitleClass(),
  })
})

const subtitleStyle = computed(() => {
  return mergedProps.value?.ui?.subtitleStyle?.()
})

// Styles - subtitle item
const subtitleItemClass = computed(() => {
  return mergedProps.value?.ui?.subtitleItemClass?.({
    defaults: NOTIFICATION_ROW_DEFAULT_PROPS.ui.subtitleItemClass(),
  })
})

const subtitleItemStyle = computed(() => {
  return mergedProps.value?.ui?.subtitleItemStyle?.()
})

// Styles - counter
const counterClass = computed(() => {
  return mergedProps.value?.ui?.counterClass?.({
    defaults: NOTIFICATION_ROW_DEFAULT_PROPS.ui.counterClass(),
  })
})

const counterStyle = computed(() => {
  return mergedProps.value?.ui?.counterStyle?.()
})
</script>

<template>
  <div
    ref="notificationEl"
    class="notification-row"
    :class="[`is-${notification.type}`, containerClass]"
    :style="[
      { '--progress': `${Math.round(((TIMEOUT - counter) / TIMEOUT) * 100)}%` },
      containerStyle,
    ]"
    data-cy="notification-row"
    @mouseenter="!noClose && pause()"
    @mouseleave="!noClose && handleResume()"
  >
    <slot name="before" />

    <!-- Title row -->
    <div
      class="notification-row__title-row"
      :class="titleRowClass"
      :style="titleRowStyle"
    >
      <!-- Icon -->
      <div
        class="notification-row__icon"
        :class="[notification.icon || icon, iconClass]"
        :style="iconStyle"
      />

      <!-- Title -->
      <div
        class="notification-row__title"
        :class="[{ 'has-subtitle': notification.subtitle }, titleClass]"
        :style="titleStyle"
      >
        <p
          class="notification-row__title-text"
          :class="titleTextClass"
          :style="titleTextStyle"
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
      class="notification-row__subtitle"
      :class="subtitleClass"
      :style="subtitleStyle"
    >
      <li
        v-for="(subtitle, idx) in subtitleArr"
        :key="idx"
        class="notification-row__subtitle-item"
        :class="subtitleItemClass"
        :style="subtitleItemStyle"
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

    <!-- Counter -->
    <span
      v-if="notificationCounter && notificationCounter > 1"
      ref="counterEl"
      class="notification-row__counter"
      :class="counterClass"
      :style="counterStyle"
    >
      {{ notificationCounter }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
// Bounce animation
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
