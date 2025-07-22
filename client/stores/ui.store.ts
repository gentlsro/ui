import { createVNode, render } from 'vue'
import { skipHydrate } from 'pinia'
import type { CSSProperties } from 'vue'
import { uiConfig } from '$uiConfig'
import utilsConfig from '$utilsConfig'

// Types
import type { IUIState } from '../types/ui-state.type'

// Functions
import { useFloatingUIUtils } from '../../client/components/FloatingUI/functions/useFloatingUIUtils'

export const useUIStore = defineStore('__ui', () => {
  const { getLastFloatingUI } = useFloatingUIUtils()

  // State
  const isInitialized = ref(false)
  const lastKeydownEvent = ref<KeyboardEvent>()
  const hasUserLeftPage = usePageLeave()

  const uiState = useCookie<IUIState>('__ui', {
    default: () => ({
      general: {
        keyboardShortcuts: false,
      },
      form: {
        confirmation: {
          enabled: uiConfig.form.confirmationInit.enabled,
          required: uiConfig.form.confirmationInit.required,
          editable: uiConfig.form.confirmationInit.editable,
        },
      },
      table: {
        autoSaveSchema: uiConfig.table.props.modifiers?.().autoSaveSchema ?? true,
        fit: uiConfig.table.props.autoFit().mode,
      },
    }),
    domain: utilsConfig.general.domain ?? undefined,
  })

  function setState(state: Partial<IUIState>, extend = true) {
    if (extend) {
      const uiStateMerged = merge(uiState.value, state)

      uiState.value = uiStateMerged
    } else {
      uiState.value = state as IUIState
    }
  }
  console.log('Fuck')

  // Temporary component
  // Usage: When we need to render a component temporarily to calculate its
  // dimensions (e.g. table cell), we can use this
  function setTempComponent(component: any, style?: CSSProperties) {
    const { vueApp } = useNuxtApp()

    const el = document.createElement('div')
    el.id = 'tempComponent'
    el.style.position = 'fixed'
    el.style.top = '80px'
    el.style.right = '80px'

    document.body.appendChild(el)

    const vnode = createVNode(component, { style })
    vnode.appContext = vueApp._context

    render(vnode, el)

    return () => {
      render(null, el)
      el.remove()
    }
  }

  // Events history
  const lastPointerDownEvent = ref<PointerEvent>()
  const lastPointerDownEl = ref<HTMLElement>()
  const lastPointerDownType = ref<string>()
  const lastPasteEvent = ref<ClipboardEvent>()

  if (!isInitialized.value) {
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
