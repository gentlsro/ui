<script setup lang="ts">
// Types
import type { IMenuProps } from './types/menu-props.type'
import type { IMenuEmits } from './types/menu-emits.type'

// Functions
import { useMenu } from './composables/useMenu'
import { useElementMovement } from '../ElementMovement/composables/useElementMovement'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Store
import { MENU_INJECTION_KEY, useMenuStore } from './store/menu.store'
import { menuUplift } from './functions/menu-uplift'
import { menuGetExposed } from './functions/menu-get-exposed'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<IMenuProps>(), {
  ...getComponentProps('menu'),
})

const emits = defineEmits<IMenuEmits>()

// Init
const instance = getCurrentInstance()
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
} = useMenuStore({ menuProps: props, instance })

// Utils
const { color } = useTheme()
const { onMoveMouseDown } = useElementMovement({
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
} = useMenu({ menuProps: props, instance })

// We sync the model with the debouncedModel immediately when the value is `true`
// to show the content immediately to trigger the transition
whenever(model, isVisible => {
  debouncedModel.value = isVisible

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

// Watch the virtual position to update the floating UI
watch(virtualDimensions, () => {
  requestAnimationFrame(() => {
    update()
  })
}, { deep: true })

// We react to page resize/scroll to reposition the floating UI
// @ts-expect-error Bad element type
const { x: pageX, y: pageY } = useElementBounding(referenceEl, { windowResize: true })

if (!props.noMove && !props.virtualConfig?.enabled) {
  watchThrottled([pageX, pageY], update, {
    trailing: true,
    throttle: 100,
  })
}

// Click outside
onClickOutside(
  floatingEl,
  handleClickOutside,
  { ignore: props.ignoreClickOutside },
)

function handleMoveMouseDown(ev: MouseEvent) {
  if (!isVirtual.value || !virtualConfig?.value?.movable) {
    return
  }

  onMoveMouseDown(ev)
}

defineExpose(menuGetExposed({
  modelHandler,
  isChangeForced,
  refreshAnchors,
  bounce,
  update,
  calculateVirtualElement,
}))
</script>

<template>
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
      :style="transitionStyle"
      @before-enter="$emit('beforeShow')"
      @before-leave="$emit('beforeHide')"
      @after-leave="commitHide"
      @after-enter="$emit('show')"
    >
      <div
        v-if="model"
        ref="floatingEl"
        class="floating-element menu"
        :data-open="model"
        :class="[mergedProps.ui?.menuClass, menuClass]"
        :style="{ ...mergedProps.ui?.menuStyle, ...menuStyle, ...floatingStyles }"
        :placement="menuPlacement"
        .hide="hide"
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
          :hide
        >
          <MenuHeader
            :ui="mergedProps.ui"
            :hide
            @mousedown="handleMoveMouseDown"
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
          </MenuHeader>
        </slot>

        <!-- Content -->
        <div
          ref="contentEl"
          class="menu__content"
          :class="[
            mergedProps.ui?.contentClass,
            { 'is-dense': dense },
          ]"
          :style="mergedProps.ui?.contentStyle"
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
.is-dense {
  @apply p-0;
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
