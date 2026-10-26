<script setup lang="ts" vapor>
// Types
import type { IMenuProps } from './types/menu-props.type'
import type { IMenuEmits } from './types/menu-emits.type'

// Functions
import { useMenu } from './composables/useMenu'
import { useElementMovement } from '../ElementMovement/composables/useElementMovement'

// Constants
import { MENU_DEFAULT_PROPS } from './constants/menu-default-props.constant'

// Store
import { MENU_INJECTION_KEY, useMenuStore } from './store/menu.store'
import { menuResetUplift, menuUplift } from './functions/menu-uplift'
import { menuGetExposed } from './functions/menu-get-exposed'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<IMenuProps>(), {
  ...getComponentProps('menu'),
})

const emits = defineEmits<IMenuEmits>()

// Init
const hostAnchor = useTemplateRef<HTMLSpanElement>('hostAnchor')
provideLocal(MENU_INJECTION_KEY, generateUUID())

const mergedProps = computed(() => {
  return getComponentMergedProps('menu', props)
})

// Store
const {
  // Template
  contentEl,
  floatingEl,
  referenceEl,
  isReferenceElTransparent,

  // State
  model,
  title,
  referenceElZIndex,
  zIndex,

  // Virtual
  isVirtual,
  virtualConfig,
  virtualDimensions,
} = useMenuStore({ menuProps: props })

// Utils
const { color } = useTheme()
const menuHeader = useTemplateRef<{ element: HTMLElement | null }>('menuHeader')
const { startMove } = useElementMovement({
  moveHandle: () => menuHeader.value?.element,
  canMove: () => !!isVirtual.value && !!virtualConfig.value?.movable,
  // @ts-expect-error Fuck this
  dimensions: virtualDimensions,
  referenceEl: floatingEl,
})

const {
  // State
  debouncedModel,
  isChangeForced,
  modelHandler,
  calculateVirtualElement,
  hide,
  commitHide,

  // Floating UI
  arrowStyles,
  floatingStyles,
  menuPlacement,
  update,

  // Template
  transitionClass,
  transitionStyle,
  menuClass,
  menuStyle,
  bounce,
  handleClickOutside,

  // Refresh
  refreshAnchors,
} = useMenu({
  menuProps: props,
  getHost: () => hostAnchor.value?.parentElement,
  onHide: () => emits('hide'),
})

watch(floatingEl, element => {
  if (element) {
    Object.assign(element, { hide })
  }
}, { flush: 'post' })

function applyUplift() {
  menuUplift({
    zIndex,
    referenceElZIndex,
    isReferenceElTransparent,
    referenceEl,
    color,
    modifiers: {
      overlay: !props.noOverlay,
      uplift: !props.noUplift,
      cover: props.cover,
    },
  })
}

function resetUplift(el?: unknown) {
  menuResetUplift({ referenceEl: el })
}

// We sync the model with the debouncedModel immediately when the value is `true`
// to show the content immediately to trigger the transition.
// `immediate` covers menus that mount already open (manual + v-if + v-model).
whenever(model, isVisible => {
  debouncedModel.value = isVisible

  applyUplift()
}, { immediate: true })

watch(referenceEl, (_nextEl, prevEl) => {
  if (!model.value) {
    return
  }

  resetUplift(prevEl)
  applyUplift()
})

const positionTask = useRafTask<void>(() => update())
useResizeObserver(contentEl, () => {
  if (!props.noMove) {
    positionTask.schedule()
  }
})

watch(menuPlacement, placement => {
  emits('update:placement', placement)
})

// Watch the virtual position to update the floating UI
watch(virtualDimensions, () => {
  positionTask.schedule()
}, { deep: true })

// We react to page resize/scroll to reposition the floating UI
// Closed menus have no floating surface to position. In particular, observing
// an anchor inside an entering Dialog makes WebKit deliver its zero-sized
// transition frame and then report an undelivered resize notification.
const activeReference = computed(() => model.value ? referenceEl.value : undefined)
// @ts-expect-error Bad element type
const { x: pageX, y: pageY } = useElementBounding(activeReference, { windowResize: true })

if (!props.noMove && !props.virtualConfig?.enabled) {
  // The frame task already coalesces movement. A second throttle would leave
  // a trailing timer that could schedule new work after the menu is disposed.
  watch([pageX, pageY], () => {
    if (model.value) {
      positionTask.schedule()
    }
  })
}

// Click outside
onClickOutside(
  floatingEl,
  handleClickOutside,
  { ignore: props.ignoreClickOutside },
)

defineExpose(menuGetExposed({
  modelHandler,
  isChangeForced,
  refreshAnchors,
  bounce,
  update,
  calculateVirtualElement,
}))

// Styles - menu
const menuClassComputed = computed(() => {
  return mergedProps.value?.ui?.menuClass?.({
    defaults: MENU_DEFAULT_PROPS.ui.menuClass(),
  })
})

const menuStyleComputed = computed(() => {
  return mergedProps.value?.ui?.menuStyle?.()
})

// Styles - content
const contentClass = computed(() => {
  return mergedProps.value?.ui?.contentClass?.({
    defaults: MENU_DEFAULT_PROPS.ui.contentClass(),
  })
})

const contentStyle = computed(() => {
  return mergedProps.value?.ui?.contentStyle?.()
})
</script>

<template>
  <span
    ref="hostAnchor"
    hidden
  />

  <Teleport
    v-if="debouncedModel"
    to="body"
  >
    <!-- Overlay -->
    <MenuOverlay
      v-if="!noOverlay"
      :transition-duration
      :ui="mergedProps.ui"
    />

    <Transition
      appear
      :css="!noTransition"
      :enter-from-class="transitionClass"
      :leave-to-class="transitionClass"
      @before-enter="$emit('beforeShow')"
      @before-leave="$emit('beforeHide')"
      @after-leave="commitHide"
      @after-enter="$emit('show')"
    >
      <div
        v-if="model"
        ref="floatingEl"
        class="floating-element menu group/menu"
        :data-open="model"
        :class="[menuClassComputed, menuClass]"
        :style="{ ...transitionStyle, ...menuStyleComputed, ...menuStyle, ...floatingStyles }"
        :placement="menuPlacement"
        v-bind="$attrs"
      >
        <!-- Arrow -->
        <MenuArrow
          v-if="!noArrow && !isVirtual"
          :style="arrowStyles"
        />

        <!-- Header -->
        <slot
          v-if="$slots.title || $slots.header || title"
          name="header"
          :mousedown="startMove"
          :pointerdown="startMove"
          :hide
        >
          <MenuHeader
            ref="menuHeader"
            :ui="mergedProps.ui"
            :hide
          >
            <!-- Title -->
            <template
              v-if="$slots.title"
              #title="titleProps"
            >
              <slot
                name="title"
                v-bind="titleProps"
              />
            </template>
            <template
              v-if="$slots['header-right']"
              #header-right
            >
              <slot name="header-right" />
            </template>
          </MenuHeader>
        </slot>

        <!-- Content -->
        <div
          ref="contentEl"
          class="menu__content"
          :class="[
            contentClass,
            { 'is-dense': dense },
          ]"
          :style="contentStyle"
          bg="inherit"
        >
          <slot :hide="hide" />
        </div>

        <!-- Resizing -->
        <ElementResize
          v-if="isVirtual && virtualConfig?.resizable"
          v-model:dimensions="virtualDimensions"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.menu {
  @apply z-$zIndex;
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

.menu[placement='right-end'] {
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
