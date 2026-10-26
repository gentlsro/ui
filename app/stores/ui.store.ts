import { defu } from 'defu'
import { skipHydrate } from 'pinia'
import { uiConfig } from '$uiConfig'

// Types
import type { IUIState } from '../types/ui-state.type'

export const useUIStore = defineStore('__ui', () => {
  const { getLastFloatingUI } = useFloatingUIUtils()

  // State
  const isInitialized = ref(false)
  const lastKeydownEvent = ref<KeyboardEvent>()
  const hasUserLeftPage = usePageLeave()

  if (import.meta.client) {
    // Re-entry can have no relatedTarget after a Firefox viewport resize.
    // It still means the pointer is back inside the page.
    useEventListener(document.documentElement, 'mouseenter', () => {
      hasUserLeftPage.value = false
    })
  }

  function getDefaultUIState() {
    return defu(uiConfig.misc.uiState, {
      form: {
        confirmation: {
          enabled: uiConfig.form.confirmationInit.enabled,
          required: uiConfig.form.confirmationInit.required,
          editable: uiConfig.form.confirmationInit.editable,
        },
      },
    })
  }

  const uiState = useCookie<IUIState>('__ui', {
    default: getDefaultUIState,
    domain: usePreferenceCookieDomain(),
    watch: true,
  })

  // Cookie Store deletion notifications use null even with a default callback.
  // Restore preferences before consumers react to an absent cookie.
  watch(uiState, state => {
    if (isNil(state)) {
      uiState.value = getDefaultUIState()
    }
  }, { flush: 'sync' })

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

  // Events history
  const lastPointerDownEvent = ref<PointerEvent>()
  const lastPointerDownEl = ref<HTMLElement>()
  const lastPointerDownType = ref<string>()
  const lastPasteEvent = ref<ClipboardEvent>()

  if (!isInitialized.value && import.meta.client) {
    useEventListener(document.documentElement, 'pointerdown', ev => {
      lastPointerDownEvent.value = ev
      lastPointerDownEl.value = ev.target as HTMLElement
      lastPointerDownType.value = ev.pointerType
    })

    useEventListener(document.documentElement, 'keydown', ev => {
      lastKeydownEvent.value = ev
    })

    useEventListener(document.documentElement, 'paste', ev => {
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
  }
})
