<script setup lang="ts">
// Types
import type { IDialogProps } from './types/dialog-props.type'

// Functions
import { useDialogLayout } from './functions/useDialogLayout'
import { useFloatingUIUtils } from '../FloatingUI/functions/useFloatingUIUtils'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<IDialogProps>(), {
  ...getComponentProps('dialog'),
})

const emits = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'hide'): void
  (e: 'show'): void
  (e: 'beforeHide'): void
  (e: 'beforeShow'): void
}>()

defineExpose({
  show: () => (modelHandler.value = true),
  hide: (force?: boolean) => {
    isChangeForced.value = !!force
    modelHandler.value = false
  },
  toggle: () => (modelHandler.value = !modelHandler.value),
  getFloatingEl: () => floatingEl.value,
})

// Utils
const { getLastFloatingUIZindex } = useFloatingUIUtils()

const mergedProps = computed(() => {
  return getComponentMergedProps('dialog', props)
})

// Layout
const model = defineModel({ default: false })
const isChangeForced = ref(false)
const debouncedModel = ref(model.value)
const zIndex = ref(0)

const title = computed(() => {
  if (typeof props.title === 'function') {
    return props.title()
  }

  return props.title
})

const modelHandler = computed({
  get: () => model.value,
  set: async val => {
    let shouldContinue = true

    if (!val && !isChangeForced.value) {
      shouldContinue = (await props.beforeHideFnc?.()) ?? true
    }

    if (shouldContinue) {
      model.value = val
    } else {
      bounce()
    }

    isChangeForced.value = false
  },
})

const dialogMaxHeight = computed(() => {
  return typeof props.maxHeight === 'number'
    ? `${props.maxHeight}px`
    : props.maxHeight
})

const transitionClass = computed(() => {
  if (props.transitionClass) {
    return props.transitionClass
  }

  switch (props.position) {
    case 'top':
      return 'opacity-0 transform-origin-top translate-y--10'
    case 'bottom':
      return 'opacity-0 transform-origin-bottom translate-y-10'
    case 'left':
      return 'opacity-0 transform-origin-left translate-x--10'
    case 'right':
      return 'opacity-0 transform-origin-right translate-x-10'
    default:
      return 'opacity-0 transform-origin-center scale-60'
  }
})

const {
  contentEl,
  dialogWrapperEl,
  floatingEl,
  triggerEl,
} = useDialogLayout(modelHandler, props)

function hide(ignorePersistent = true) {
  if (props.persistent && !ignorePersistent) {
    bounce()

    return
  }

  modelHandler.value = false
}

function commitHide() {
  if (model.value) {
    return
  }

  debouncedModel.value = false

  triggerEl.value?.classList.remove('is-dialog-active')
  emits('hide')
}

// We sync the model with the debouncedModel immediately when the value is `true`
// to show the content immediately to trigger the transition
whenever(model, isVisible => {
  zIndex.value = getLastFloatingUIZindex() + 1
  debouncedModel.value = isVisible

  triggerEl.value?.classList.add('is-dialog-active')
}, { immediate: true })

// Click outside
onClickOutside(floatingEl, handleClickOutside, {
  ignore: props.ignoreClickOutside,
})

function handleClickOutside(ev: Event) {
  if (!model.value) {
    return
  }

  const targetEl = ev.target as HTMLElement

  const isTargetBody = targetEl === document.body
  const isPartOfFloatingUI = floatingEl.value?.contains(targetEl)
  const lastFloatingElement = Array.from(document.querySelectorAll('.floating-element')).pop()
  const isNotifications = !!targetEl.closest('.notifications')

  if (
    !isTargetBody
    && !isPartOfFloatingUI
    && !isNotifications
    && lastFloatingElement === dialogWrapperEl.value
  ) {
    if (props.persistent) {
      bounce()

      return
    }

    hide()
  }
}

// Animations
function bounce() {
  const _floatingEl = floatingEl.value as HTMLElement

  _floatingEl.addEventListener('animationend', () => {
    _floatingEl.classList.remove('bounce')
  })
  _floatingEl.classList.add('bounce')
}
</script>

<template>
  <Teleport
    v-if="debouncedModel"
    to="body"
  >
    <!-- Overlay -->
    <div
      v-if="!noOverlay"
      class="backdrop"
      :style="{
        ...mergedProps.ui?.backdropStyle,
        '--transitionDuration': `${transitionDuration}ms`,
        '--zIndex': zIndex,
      }"
      :class="[mergedProps.ui?.backdropClass, { 'is-active': model }]"
    />

    <Transition
      appear
      :css="!noTransition"
      :enter-from-class="transitionClass"
      :leave-to-class="transitionClass"
      :duration="transitionDuration"
      :style="{ '--transitionDuration': `${transitionDuration}ms` }"
      @before-enter="$emit('beforeShow')"
      @before-leave="$emit('beforeHide')"
      @after-leave="commitHide"
      @after-enter="$emit('show')"
    >
      <div
        v-if="model"
        ref="dialogWrapperEl"
        class="dialog__wrapper floating-element"
        :data-open="model"
        :position
        :style="{
          '--dialogMaxHeight': dialogMaxHeight,
          '--zIndex': zIndex,
        }"
        .hide="hide"
      >
        <!-- Dialog -->
        <div
          ref="floatingEl"
          class="dialog"
          :style="{ '--transitionDuration': `${transitionDuration}ms` }"
          :class="{ 'has-transition': !noTransition }"
          h="120"
          w="100"
          max-h="[min(95%,var(--dialogMaxHeight))]"
          max-w="95vw"
          v-bind="$attrs"
        >
          <!-- Header -->
          <slot
            v-if="$slots.title || $slots.header || title"
            name="header"
            :hide="hide"
          >
            <div
              class="dialog__header"
              :class="mergedProps.ui?.headerClass"
              :style="mergedProps.ui?.headerStyle"
            >
              <!-- Title -->
              <slot
                v-if="$slots.title || $slots.header || title"
                name="title"
                :hide="hide"
              >
                <h6
                  class="dialog__header-title"
                  :class="mergedProps.ui?.titleClass"
                  :style="mergedProps.ui?.titleStyle"
                >
                  {{ title }}
                </h6>
              </slot>

              <slot name="header-right" />

              <!-- Close button -->
              <Btn
                v-if="!noClose"
                preset="CLOSE"
                size="sm"
                self-start
                @click="hide"
              />
            </div>
          </slot>

          <!-- Content -->
          <div
            ref="contentEl"
            class="dialog__content"
            :class="mergedProps.ui?.contentClass ?? 'p-1'"
            :style="mergedProps.ui?.contentStyle"
          >
            <slot :hide="hide" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.dialog {
  @apply flex flex-col max-w-95vw max-h-95% rounded-custom z-1 border-1
    border-ca pointer-events-auto bg-white dark:bg-darker;

  &__wrapper {
    @apply flex fixed inset-0 pointer-events-none z-$zIndex;
  }

  &__header {
    @apply flex items-center gap-2 p-l-3 p-r-1 p-y-2 rounded-t-custom;

    &-title {
      @apply grow;
    }
  }

  &__content {
    @apply relative flex flex-col grow gap-1 overflow-auto rounded-custom;
  }
}

// Position
.dialog__wrapper[position='top'] {
  @apply justify-center items-start;

  .dialog {
    @apply rounded-t-none;
  }
}

.dialog__wrapper[position='bottom'] {
  @apply justify-center items-end;

  .dialog {
    @apply rounded-b-none;
  }
}
.dialog__wrapper[position='left'] {
  @apply justify-start items-center;

  .dialog {
    @apply rounded-l-none;
  }
}

.dialog__wrapper[position='right'] {
  @apply justify-end items-center;

  .dialog {
    @apply rounded-r-none;
  }
}

.dialog__wrapper[position='center'] {
  @apply flex-center;
}

.v-enter-active,
.v-leave-active {
  @apply pointer-events-none transition-all;

  transition-timing-function: ease-out;
  transition-duration: var(--transitionDuration);
}

// Backdrop
.backdrop {
  @apply fixed inset-0 transition-background-color z-$zIndex
    duration-$transitionDuration ease-out bg-transparent;

  &.is-active {
    @apply bg-darker/70;
  }
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
    transform: scale(1.05);
  }
}
</style>
