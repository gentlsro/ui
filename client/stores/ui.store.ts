import { createVNode, render } from 'vue'
import { skipHydrate } from 'pinia'
import type { CSSProperties } from 'vue'
import { uiConfig } from '$uiConfig'

// Types
import type { IUIState } from '../types/ui-state.type'

export const useUIStore = defineStore('__ui', () => {
  // State
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
        autoSaveSchema: true,
        fit: uiConfig.table.props.autoFit().mode,
      },
    }),
  })

  function setState(state: Partial<IUIState>, extend = true) {
    if (extend) {
      const uiStateMerged = merge(uiState.value, state)

      uiState.value = uiStateMerged
    } else {
      uiState.value = state as IUIState
    }
  }

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

  onMounted(() => {
    document.documentElement.addEventListener('pointerdown', ev => {
      lastPointerDownEvent.value = ev
      lastPointerDownEl.value = ev.target as HTMLElement
      lastPointerDownType.value = ev.pointerType
    })
  })

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
    lastPointerDownEvent,
    lastPointerDownEl,
    lastPointerDownType,

    setState: skipHydrate(setState),

    // Active element
    activeElement,
    isActiveElementInput: skipHydrate(isActiveElementInput),

    // Temporary component
    setTempComponent: skipHydrate(setTempComponent),
  }
})
