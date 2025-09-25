// @unocss-include

import type { ComponentInternalInstance } from 'vue'
import { shift, useFloating } from '@floating-ui/vue'

// Types
import { useMenuStore } from '../store/menu.store'
import type { IMenuProps } from '../types/menu-props.type'

// Functions
import { useMenuMiddleware } from './useMenuMiddleware'
import { useFloatingUIUtils } from '../../FloatingUI/functions/useFloatingUIUtils'
import { getElementSize } from '$utils'

export function useMenu(payload: {
  menuProps: IMenuProps
  instance: ComponentInternalInstance | null
}) {
  const { menuProps, instance } = payload

  // Utils
  const { getElement } = useFloatingUIUtils()

  /**
   * Refreshes the `referenceEl` and `triggerEl`
   */
  function refreshAnchors() {
    const parentEl = instance?.vnode?.el?.parentNode

    if (triggerEl.value instanceof Element) {
      triggerEl.value?.removeEventListener(menuProps.trigger ?? 'click', toggle)
    }

    // Assign the elements
    triggerEl.value = getElement({ elRef: menuProps.target ?? parentEl, parentEl })
    referenceEl.value = getElement({ elRef: menuProps.referenceTarget ?? parentEl, parentEl })

    if (referenceEl.value && referenceEl.value instanceof Element) {
      referenceEl.value.classList.add('has-menu')

      const referenceElStyle = getComputedStyle(referenceEl.value)
      referenceElZIndex.value = referenceElStyle.zIndex
      isReferenceElTransparent.value = referenceElStyle.backgroundColor === 'rgba(0, 0, 0, 0)'
    }

    // Add event listeners when not using the `manual` mode
    if (!menuProps.manual && triggerEl.value instanceof Element) {
      triggerEl.value?.addEventListener(menuProps.trigger ?? 'click', toggle)
    }
  }

  // Watch for element changes to refresh the anchors
  watch([
    () => menuProps.target,
    () => menuProps.referenceTarget,
  ], () => refreshAnchors())

  // Store
  const { lastPointerDownEvent } = storeToRefs(useUIStore())
  const {
    model,
    referenceEl,
    triggerEl,
    referenceElZIndex,
    isReferenceElTransparent,
    floatingReferenceEl,
    floatingEl,
    arrowEl,
    zIndex,

    // Virtual
    isVirtual,
    virtualEl,
    virtualDimensions,
  } = useMenuStore()

  // State
  const debouncedModel = ref(model.value)
  const isChangeForced = ref(false)

  // Modle handling
  const modelHandler = computed({
    get: () => model.value,
    set: async val => {
      let shouldContinue = true

      if (!val && !isChangeForced.value) {
        shouldContinue = (await menuProps.beforeHideFnc?.()) ?? !menuProps.persistent
      }

      if (shouldContinue) {
        model.value = val
      } else {
        bounce()
      }

      isChangeForced.value = false
    },
  })

  function toggle(ev?: Event) {
    const isContextMenu = ev?.type === 'contextmenu'

    if (isContextMenu) {
      ev?.preventDefault()
    }

    model.value = !model.value
  }

  function hide(force?: boolean) {
    isChangeForced.value = !!force
    modelHandler.value = false
  }

  function commitHide() {
    if (model.value) {
      return
    }

    debouncedModel.value = false

    const _referenceEl = referenceEl.value as HTMLElement

    if (_referenceEl instanceof Element) {
      _referenceEl.classList.remove('is-menu-active')
      _referenceEl.style.zIndex = referenceElZIndex.value!

      if (isReferenceElTransparent.value && !menuProps.noUplift) {
        _referenceEl.style.backgroundColor = ''
      }
    }

    instance?.emit('hide')
  }

  // Create a virtual element on show
  whenever(model, () => {
    if (!isVirtual.value) {
      return null
    }

    calculateVirtualElement()
  })

  function syncFloatingUIWithVirtualDimensions(payload?: {
    onDone?: () => void
  }) {
    requestAnimationFrame(() => {
      const isXDiff = virtualDimensions.value?.x !== floatingUI.x.value
      const isYDiff = virtualDimensions.value?.y !== floatingUI.y.value
      const { total } = getElementSize(
        floatingEl.value as HTMLElement,
        { includeBorder: true, includePadding: true, includeMargin: true },
      )

      if (isXDiff || isYDiff || !virtualDimensions.value?.w || !virtualDimensions.value?.h) {
        virtualDimensions.value = {
          ...virtualDimensions.value!,
          x: floatingUI.x.value,
          y: floatingUI.y.value,
          w: total.width,
          h: total.height,
        }
      }

      payload?.onDone?.()
    })
  }

  function calculateVirtualElement() {
    // Virtual based on virtual position
    const hasX = !isNil(virtualDimensions.value?.x)
    const hasY = !isNil(virtualDimensions.value?.y)

    if (isVirtual.value && virtualDimensions.value && hasX && hasY) {
      virtualEl.value = {
        getBoundingClientRect: () => ({
          width: 0,
          height: 0,
          x: virtualDimensions.value?.x ?? 0,
          y: virtualDimensions.value?.y ?? 0,
          left: virtualDimensions.value?.x ?? 0,
          top: virtualDimensions.value?.y ?? 0,
        }),
      }

      // Sync the virtual dimensions with the floating UI
      syncFloatingUIWithVirtualDimensions()

      return
    }

    // Virtual based on last pointer down event
    if (!lastPointerDownEvent.value) {
      return null
    }

    const { clientX, clientY } = lastPointerDownEvent.value

    virtualEl.value = {
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        x: clientX,
        y: clientY,
        left: clientX,
        top: clientY,
      }),
    }

    // Sync the virtual dimensions with the floating UI
    if (virtualDimensions.value && (!hasX || !hasY)) {
      syncFloatingUIWithVirtualDimensions({
        onDone: calculateVirtualElement,
      })
    }
  }

  // Floating UI
  const { middleware } = useMenuMiddleware(menuProps, { arrowEl })
  const floatingUI = isVirtual.value && virtualDimensions.value
    ? useFloating(floatingReferenceEl, floatingEl, {
        placement: 'bottom-start',
        strategy: 'fixed',
        transform: false,
        middleware: [shift({ padding: 0, crossAxis: true })],
      })
    : useFloating(floatingReferenceEl, floatingEl, {
        middleware,
        placement: menuProps.placement,
        strategy: 'fixed',
        transform: false,
      })

  const arrowStyles = computed(() => {
    const { x, y } = floatingUI.middlewareData.value?.arrow ?? {}

    return { ...(x && { left: `${x}px` }), ...(y && { top: `${y}px` }) }
  })

  // Template
  const transitionClass = computed(() => {
    switch (floatingUI.placement.value) {
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

  const transitionStyle = computed(() => {
    return {
      '--transitionDuration': `${menuProps.transitionDuration}ms`,
      '--zIndex': zIndex.value,
    }
  })

  const menuWrapperClass = computed(() => {
    return {
      'is-cover': menuProps.cover,
      'is-fit': menuProps.fit,
      'is-match-width': menuProps.matchWidth,
      'has-transition': !menuProps.noTransition,
    }
  })

  const menuWrapperStyle = computed(() => {
    return {
      ...(menuProps.virtualDimensions && {
        width: `${menuProps.virtualDimensions.w}px`,
        height: `${menuProps.virtualDimensions.h}px`,
      }),
    }
  })

  function bounce() {
    if (menuProps.noBounce) {
      return
    }

    const _floatingEl = floatingEl.value as HTMLElement

    _floatingEl.addEventListener('animationend', () => {
      _floatingEl.classList.remove('bounce')
    })
    _floatingEl.classList.add('bounce')
  }

  function handleClickOutside(ev: Event) {
    if (!model.value) {
      return
    }

    const targetEl = ev.target as HTMLElement

    const isTargetBody = targetEl === document.body
    const isPartOfFloatingUI = floatingEl.value?.contains(targetEl)
    const isPartOfReferenceEl = !isVirtual.value && (floatingReferenceEl.value as any)!.contains(targetEl)

    const lastFloatingElement = Array.from(document.querySelectorAll('.floating-element')).pop()
    const isNotifications = !!targetEl.closest('.notifications')

    if (
      !isTargetBody
      && !isPartOfFloatingUI
      && !isPartOfReferenceEl
      && !isNotifications
      && lastFloatingElement === floatingEl.value
    ) {
      if (menuProps.persistent) {
        bounce()

        return
      }

      hide()
    }
  }

  // Lifecycle
  onMounted(async () => {
    await nextTick()
    refreshAnchors()
  })

  onBeforeUnmount(() => {
    if (triggerEl.value instanceof Element) {
      triggerEl.value?.removeEventListener(menuProps.trigger ?? 'click', toggle)
    }
  })

  return {
    // State
    debouncedModel,
    isChangeForced,
    modelHandler,
    hide,
    commitHide,

    // Floating UI
    floatingStyles: floatingUI.floatingStyles,
    middlewareData: floatingUI.middlewareData,
    menuPlacement: floatingUI.placement,
    update: floatingUI.update,
    arrowStyles,

    // Template
    transitionClass,
    transitionStyle,
    menuWrapperClass,
    menuWrapperStyle,
    bounce,
    handleClickOutside,

    // Refresh
    refreshAnchors,
  }
}
