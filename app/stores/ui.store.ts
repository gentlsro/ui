import { createVNode, render } from 'vue'
import { defu } from 'defu'
import { skipHydrate } from 'pinia'
import type { Component, CSSProperties } from 'vue'
import { uiConfig } from '$uiConfig'

// Types
import type { IUIState } from '../types/ui-state.type'

export const useUIStore = defineStore('__ui', () => {
  const rC = useRuntimeConfig()
  const { vueApp } = useNuxtApp()
  const { getLastFloatingUI } = useFloatingUIUtils()

  // State
  const isInitialized = ref(false)
  const lastKeydownEvent = ref<KeyboardEvent>()
  const hasUserLeftPage = usePageLeave()

  const uiState = useCookie<IUIState>('__ui', {
    default: () => defu(uiConfig.misc.uiState, {
      form: {
        confirmation: {
          enabled: uiConfig.form.confirmationInit.enabled,
          required: uiConfig.form.confirmationInit.required,
          editable: uiConfig.form.confirmationInit.editable,
        },
      },
    }),
    domain: rC.public.domain || undefined,
    watch: true,
  })

  function setState(state: Partial<IUIState>, extend = true) {
    if (extend) {
      const uiStateMerged = merge(uiState.value, state)

      uiState.value = uiStateMerged
    } else {
      uiState.value = state as IUIState
    }
  }

  // Viewport
  const {
    viewportWidthCookie,
    viewportHeightCookie,
    height,
    width,
  } = useViewport()

  // VDOM interop boundary for Table's legacy render-function measurements.
  // Detached roots inherit app providers, not providers from the calling owner.
  function setTempComponent(component: Component, style?: CSSProperties) {
    if (import.meta.server) {
      return Object.assign(() => {}, { element: undefined })
    }

    const element = document.createElement('div')
    element.dataset.uiTempComponent = ''
    Object.assign(element.style, {
      position: 'fixed',
      top: '80px',
      right: '80px',
      visibility: 'hidden',
      pointerEvents: 'none',
    })
    element.inert = true
    document.body.appendChild(element)

    let removed = false
    const cleanup = Object.assign(() => {
      if (removed) {
        return
      }

      removed = true
      try {
        render(null, element)
      } finally {
        element.remove()
      }
    }, { element })

    try {
      const vnode = createVNode(component, { style })
      vnode.appContext = vueApp._context
      render(vnode, element)
    } catch (error) {
      cleanup()
      throw error
    }

    return cleanup
  }

  // Events history
  const lastPointerDownEvent = ref<PointerEvent>()
  const lastPointerDownEl = ref<HTMLElement>()
  const lastPointerDownType = ref<string>()
  const lastPasteEvent = ref<ClipboardEvent>()

  if (!isInitialized.value && import.meta.client) {
    document.documentElement.addEventListener('pointerdown', ev => {
      lastPointerDownEvent.value = ev
      lastPointerDownEl.value = ev.target as HTMLElement
      lastPointerDownType.value = ev.pointerType
    })

    document.documentElement.addEventListener('keydown', ev => {
      lastKeydownEvent.value = ev
    })

    document.documentElement.addEventListener('paste', ev => {
      lastPasteEvent.value = ev
    })

    // Floating UI tracking
    useMutationObserver(document.body, () => {
      isAnyFloatingUIOpen.value = !!getLastFloatingUI()
    }, { childList: true })

    isInitialized.value = true
  }

  const isAnyFloatingUIOpen = ref(false)

  // Active element
  const activeElement = useActiveElement()

  function isActiveElementInput() {
    return !!(
      activeElement.value?.tagName === 'INPUT'
      || activeElement.value?.tagName === 'TEXTAREA'
      || activeElement.value?.contentEditable !== 'inherit'
      || activeElement.value?.role === 'textbox' // For Monaco editor
    )
  }

  return {
    // State
    uiState,
    hasUserLeftPage,
    lastKeydownEvent,
    lastPointerDownEvent,
    lastPointerDownEl,
    lastPointerDownType,
    lastPasteEvent,

    // Viewport
    viewportWidthCookie,
    viewportHeightCookie,
    height,
    width,

    setState: skipHydrate(setState),

    // Active element
    activeElement,
    isActiveElementInput: skipHydrate(isActiveElementInput),

    // Floating UI
    isAnyFloatingUIOpen,

    // Temporary component
    setTempComponent: skipHydrate(setTempComponent),
  }
})
