<script setup lang="ts">
import { useFloating } from '@floating-ui/vue'
import type { Placement } from '@floating-ui/vue'

// Types
import type { IMenuProps } from './types/menu-props.type'

// Functions
import { useMenuLayout } from './functions/useMenuLayout'
import { useMenuMiddleware } from './functions/useMenuMiddleware'
import { useFloatingUIUtils } from '../FloatingUI/functions/useFloatingUIUtils'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<IMenuProps>(), {
  ...getComponentProps('menu'),
})

const emits = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'hide'): void
  (e: 'show'): void
  (e: 'update:placement', placement: Placement): void
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
  refreshAnchors: () => refreshAnchors(),
  recomputePosition: (_bounce?: boolean) => {
    if (_bounce) {
      bounce()
    }

    update()
  },
})

// Utils
const { color } = useTheme()
const { getLastFloatingUIZindex } = useFloatingUIUtils()

const mergedProps = computed(() => {
  return getComponentMergedProps('menu', props)
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
      shouldContinue = (await props.beforeHideFnc?.()) ?? !props.persistent
    }

    if (shouldContinue) {
      model.value = val
    } else {
      bounce()
    }

    isChangeForced.value = false
  },
})

const {
  arrowEl,
  contentEl,
  floatingEl,
  referenceEl,
  isReferenceElTransparent,
  referenceElZIndex,
  floatingReferenceEl,
  refreshAnchors,
} = useMenuLayout(modelHandler, props)

const transitionClass = computed(() => {
  switch (menuPlacement.value) {
    case 'top':
    case 'top-end':
    case 'top-start':
      return 'opacity-0 transform-origin-top translate-y-6'

    case 'bottom':
    case 'bottom-end':
    case 'bottom-start':
      return 'opacity-0 transform-origin-bottom translate-y--6'

    case 'left':
    case 'left-end':
    case 'left-start':
      return 'opacity-0 transform-origin-left translate-x-6'

    case 'right':
    case 'right-end':
    case 'right-start':
      return 'opacity-0 transform-origin-right translate-x--6'

    default:
      return 'opacity-0 transform-origin-center scale-20'
  }
})

function hide(force?: boolean) {
  isChangeForced.value = !!force
  modelHandler.value = false
}

function commitHide() {
  if (model.value) {
    return
  }

  debouncedModel.value = false

  const referenceEl = floatingReferenceEl.value as HTMLElement

  if (referenceEl instanceof Element) {
    referenceEl.classList.remove('is-menu-active')
    referenceEl.style.zIndex = referenceElZIndex.value!

    if (isReferenceElTransparent.value && !props.noUplift) {
      referenceEl.style.backgroundColor = ''
    }
  }

  emits('hide')
}

// We sync the model with the debouncedModel immediately when the value is `true`
// to show the content immediately to trigger the transition
whenever(model, isVisible => {
  zIndex.value = getLastFloatingUIZindex() + 1
  debouncedModel.value = isVisible

  const referenceEl = floatingReferenceEl.value as HTMLElement

  if (!(referenceEl instanceof Element)) {
    return
  }

  const referenceElStyle = getComputedStyle(referenceEl as any)

  referenceEl.classList.add('is-menu-active')
  referenceElZIndex.value = referenceElStyle.zIndex

  isReferenceElTransparent.value = referenceElStyle.backgroundColor === 'rgba(0, 0, 0, 0)'

  if ((!props.noOverlay || !props.noUplift) && !props.cover) {
    referenceEl.style.zIndex = `${zIndex.value + 1}`
  }

  if (isReferenceElTransparent.value && !props.noUplift && !props.cover) {
    if (color.value === 'light') {
      referenceEl.style.backgroundColor = 'white'
    } else {
      referenceEl.style.backgroundColor = 'black'
    }
  }
})

// Floating UI
const { middleware } = useMenuMiddleware(props, { arrowEl })

const {
  floatingStyles,
  middlewareData,
  placement: menuPlacement,
  update,
} = useFloating(floatingReferenceEl, floatingEl, {
  middleware,
  placement: props.placement,
  strategy: 'fixed',
  transform: false,
})

useResizeObserver(contentEl, () => {
  requestAnimationFrame(() => {
    if (!props.noMove) {
      update()
    }
  })
})

watch(menuPlacement, placement => {
  emits('update:placement', placement)
})

// We react to page resize/scroll to reposition the floating UI
const {
  x: pageX,
  y: pageY,
  // @ts-expect-error Bad element type
} = useElementBounding(referenceEl, { windowResize: true })

if (!props.noMove && !props.virtual) {
  watchThrottled([pageX, pageY], update, {
    trailing: true,
    throttle: 100,
  })
}

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
  const isPartOfReferenceEl = !props.virtual && (floatingReferenceEl.value as any)!.contains(targetEl)

  const lastFloatingElement = Array.from(document.querySelectorAll('.floating-element')).pop()
  const isNotifications = !!targetEl.closest('.notifications')

  if (
    !isTargetBody
    && !isPartOfFloatingUI
    && !isPartOfReferenceEl
    && !isNotifications
    && lastFloatingElement === floatingEl.value
  ) {
    if (props.persistent) {
      bounce()

      return
    }

    hide()
  }
}

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

// Arrow
const arrowStyles = computed(() => {
  const { x, y } = middlewareData.value?.arrow ?? {}

  return {
    ...(x && { left: `${x}px` }),
    ...(y && { top: `${y}px` }),
  }
})

// Overlay
const isOverlayVisible = computed(() => {
  return !props.noOverlay
})
</script>

<template>
  <Teleport
    v-if="debouncedModel"
    to="body"
  >
    <!-- Overlay -->
    <div
      v-if="isOverlayVisible"
      class="backdrop"
      :style="{
        '--transitionDuration': `${transitionDuration}ms`,
        '--zIndex': zIndex,
      }"
      :class="{ 'is-open': model }"
    />

    <Transition
      appear
      :css="!noTransition"
      :enter-from-class="transitionClass"
      :leave-to-class="transitionClass"
      :style="{
        '--transitionDuration': `${transitionDuration}ms`,
        '--zIndex': zIndex,
      }"
      @before-enter="$emit('beforeShow')"
      @before-leave="$emit('beforeHide')"
      @after-leave="commitHide"
      @after-enter="$emit('show')"
    >
      <div
        v-if="model"
        ref="floatingEl"
        class="floating-element menu"
        bg="white dark:darker"
        :style="floatingStyles"
        :data-open="model"
        :class="{
          'is-cover': cover,
          'is-fit': fit,
          'is-match-width': matchWidth,
          'has-transition': !noTransition,
        }"
        :placement="menuPlacement"
        .hide="hide"
        v-bind="$attrs"
      >
        <!-- Arrow -->
        <div
          v-if="!noArrow"
          ref="arrowEl"
          class="menu__arrow"
          :style="arrowStyles"
        />

        <!-- Header -->
        <slot
          v-if="$slots.title || $slots.header || title"
          name="header"
          :hide="hide"
        >
          <div
            class="menu__header"
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
                class="menu__header-title"
                :class="mergedProps.ui?.titleClass"
                :style="mergedProps.ui?.titleStyle"
              >
                {{ title }}
              </h6>
            </slot>

            <slot name="header-right" />

            <!-- Close -->
            <Btn
              v-if="!noClose"
              preset="CLOSE"
              size="sm"
              self="start"
              @click="hide(true)"
            />
          </div>
        </slot>

        <div
          ref="contentEl"
          class="menu__content"
          :class="mergedProps.ui?.contentClass ?? 'p-1'"
          :style="mergedProps.ui?.contentStyle"
          bg="inherit"
        >
          <slot :hide="hide" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.menu {
  @apply flex flex-col max-w-95vw max-h-95% rounded-custom z-$zIndex
    rounded-custom border-1 border-ca;

  @apply shadow-consistent-xs shadow-darker/20;

  &__header {
    @apply flex items-center gap-2 p-l-3 p-r-1 p-y-2 rounded-t-custom;

    &-title {
      @apply grow;
    }
  }

  &__arrow {
    @apply absolute w-2 h-2 rotate-45 bg-white dark:bg-darker z--1;
  }

  &__content {
    @apply relative flex flex-col grow gap-1 overflow-auto rounded-custom;
  }
}

// Arrow placement
.menu[placement^='top'] > .menu__arrow {
  @apply bottom--4px shadow-darker/12;
  // @apply border-b-custom border-r-custom border-ca;

  box-shadow: 1px 1px 2px 1px var(--un-shadow-color);
}

.menu[placement^='bottom'] > .menu__arrow {
  @apply top--4px shadow-darker/12;
  // @apply border-t-custom border-l-custom border-ca;

  box-shadow: -1px -1px 2px 1px var(--un-shadow-color);
}

.menu[placement^='left'] > .menu__arrow {
  @apply right--4px shadow-darker/12;
  // @apply border-r-custom border-t-custom border-ca;

  box-shadow: 1px -1px 2px 1px var(--un-shadow-color);
}

.menu[placement^='right'] > .menu__arrow {
  @apply left--4px shadow-darker/12;
  // @apply border-l-custom border-b-custom border-ca;

  box-shadow: -1px 1px 2px 1px var(--un-shadow-color);
}

// Transition
.menu[placement='top'] {
  @apply transform-origin-bottom;
}

.menu[placement='top-start'] {
  @apply transform-origin-bottom-left;
}

.menu[placement='top-end'] {
  @apply transform-origin-bottom-right;
}

.menu[placement='bottom'] {
  @apply transform-origin-top;
}

.menu[placement='bottom-start'] {
  @apply transform-origin-top-left;
}

.menu[placement='bottom-end'] {
  @apply transform-origin-top-right;
}

.menu[placement='left'] {
  @apply transform-origin-right;
}

.menu[placement='left-start'] {
  @apply transform-origin-top-right;
}

.menu[placement='left-end'] {
  @apply transform-origin-bottom-right;
}

.menu[placement='right'] {
  @apply transform-origin-left;
}

.menu[placement='right-start'] {
  @apply transform-origin-top-left;
}
s .menu[placement='right-end'] {
  @apply transform-origin-bottom-left;
}
.menu.is-cover {
  @apply transform-origin-center;
}

.v-enter-active,
.v-leave-active {
  @apply pointer-events-none;

  transition-duration: var(--transitionDuration);
  transition:
    opacity 0.3s ease,
    transform 0.3s cubic-bezier(0.19, 1, 0.22, 1);
}

// .v-enter-from,
// .v-leave-to {
//   @apply opacity-0 scale-100;
// }

// Backdrop
.backdrop {
  @apply fixed inset-0 transition-background-color z-$zIndex
    duration-$transitionDuration ease bg-transparent;
}

.backdrop.is-open {
  @apply bg-darker/70;
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

// Selector
.selector-menu.is-menu-width-matched {
  &[placement^='top'] {
    @apply rounded-b-0;
  }

  &[placement^='bottom'] {
    @apply rounded-t-0;
  }
}
</style>
