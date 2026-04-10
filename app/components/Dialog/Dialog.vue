<script setup lang="ts">
// Types
import type { IDialogProps } from './types/dialog-props.type'

// Functions
import { useDialogLayout } from './functions/useDialogLayout'

// Constants
import { DIALOG_DEFAULT_PROPS } from './constants/dialog-default-props.constant'

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
  if (props.noBounce) {
    return
  }

  const _floatingEl = floatingEl.value as HTMLElement

  _floatingEl.addEventListener('animationend', () => {
    _floatingEl.classList.remove('bounce')
  })
  _floatingEl.classList.add('bounce')
}

// Styles - backdrop
const backdropClass = computed(() => {
  return mergedProps.value?.ui?.backdropClass?.({
    defaults: DIALOG_DEFAULT_PROPS.ui.backdropClass(),
  })
})

const backdropStyle = computed(() => {
  return mergedProps.value?.ui?.backdropStyle?.()
})

// Styles - wrapper
const wrapperClass = computed(() => {
  return mergedProps.value?.ui?.wrapperClass?.({
    defaults: DIALOG_DEFAULT_PROPS.ui.wrapperClass(),
  })
})

const wrapperStyle = computed(() => {
  return mergedProps.value?.ui?.wrapperStyle?.()
})

// Styles - dialog
const dialogClass = computed(() => {
  return mergedProps.value?.ui?.dialogClass?.({
    defaults: DIALOG_DEFAULT_PROPS.ui.dialogClass({
      position: props.position ?? 'center',
    }),
  })
})

const dialogStyle = computed(() => {
  return mergedProps.value?.ui?.dialogStyle?.()
})

// Styles - header
const headerClass = computed(() => {
  return mergedProps.value?.ui?.headerClass?.({
    defaults: DIALOG_DEFAULT_PROPS.ui.headerClass(),
  })
})

const headerStyle = computed(() => {
  return mergedProps.value?.ui?.headerStyle?.()
})

// Styles - title
const titleClass = computed(() => {
  return mergedProps.value?.ui?.titleClass?.({
    defaults: DIALOG_DEFAULT_PROPS.ui.titleClass(),
  })
})

const titleStyle = computed(() => {
  return mergedProps.value?.ui?.titleStyle?.()
})

// Styles - content
const contentClass = computed(() => {
  return mergedProps.value?.ui?.contentClass?.({
    defaults: DIALOG_DEFAULT_PROPS.ui.contentClass(),
  })
})

const contentStyle = computed(() => {
  return mergedProps.value?.ui?.contentStyle?.()
})

// Classes
const contentClasses = computed(() => {
  return {
    'is-dense': props.dense,
  }
})
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
        ...backdropStyle,
        '--transitionDuration': `${transitionDuration}ms`,
        '--zIndex': zIndex,
      }"
      :class="[backdropClass, { 'is-active': model }]"
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
        class="dialog__wrapper floating-element group/dialog"
        :class="wrapperClass"
        :data-open="model"
        :position
        :style="{
          ...wrapperStyle,
          '--dialogMaxHeight': dialogMaxHeight,
          '--zIndex': zIndex,
        }"
        .hide="hide"
      >
        <!-- Dialog -->
        <div
          ref="floatingEl"
          class="dialog"
          :style="{
            ...dialogStyle,
            '--transitionDuration': `${transitionDuration}ms`,
          }"
          :class="[
            dialogClass,
            { 'has-transition': !noTransition },
          ]"
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
              :class="headerClass"
              :style="headerStyle"
            >
              <!-- Title -->
              <slot
                v-if="$slots.title || $slots.header || title"
                name="title"
                :hide="hide"
              >
                <h6
                  class="dialog__header-title"
                  :class="titleClass"
                  :style="titleStyle"
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
            :class="[contentClasses, contentClass]"
            :style="contentStyle"
          >
            <slot :hide="hide" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
// Transition
.v-enter-active,
.v-leave-active {
  @apply pointer-events-none transition-all;

  transition-timing-function: ease-out;
  transition-duration: var(--transitionDuration);
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
