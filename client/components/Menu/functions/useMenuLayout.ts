// Types
import type { IMenuProps } from '../types/menu-props.type'

// Functions
import { useMenuUtils } from './useMenuUtils'

export function useMenuLayout(model: Ref<boolean>, props: IMenuProps) {
  // Utils
  const instance = getCurrentInstance()
  const { getElement } = useMenuUtils()

  // Store
  const { lastPointerDownEvent } = storeToRefs(useUIStore())

  // Layout
  const floatingEl = ref<HTMLDivElement>()
  const arrowEl = ref<HTMLElement>()
  const referenceEl = ref<ReturnType<typeof getElement>>()
  const triggerEl = ref<ReturnType<typeof getElement>>()
  const contentEl = ref<HTMLElement>()
  const referenceElZIndex = ref<string>()
  const isReferenceElTransparent = ref(false)
  const virtualEl = ref<any>()

  watch(model, () => {
    if (!props.virtual || !lastPointerDownEvent.value) {
      return null
    }

    const { clientX, clientY } = lastPointerDownEvent.value

    virtualEl.value = {
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        x: clientX,
        y: clientY,
        top: clientY,
        left: clientX,
        right: clientX,
        bottom: clientY,
      }),
    }
  })

  const floatingReferenceEl = computed(() => {
    if (props.virtual) {
      return virtualEl.value
    }

    return referenceEl.value
  })

  // Methods
  function toggle(ev?: Event) {
    const isContextMenu = ev?.type === 'contextmenu'

    if (isContextMenu) {
      ev?.preventDefault()
    }

    model.value = !model.value
  }

  /**
   * Refreshes the `referenceEl` and `triggerEl`
   */
  function refreshAnchors() {
    const parentEl = instance?.vnode?.el?.parentNode

    if (triggerEl.value instanceof Element) {
      triggerEl.value?.removeEventListener(props.trigger ?? 'click', toggle)
    }

    // Assign the elements
    triggerEl.value = getElement({ elRef: props.target ?? parentEl, parentEl })
    referenceEl.value = getElement({ elRef: props.referenceTarget ?? parentEl, parentEl })

    if (referenceEl.value && referenceEl.value instanceof Element) {
      referenceEl.value.classList.add('has-menu')

      const referenceElStyle = getComputedStyle(referenceEl.value)
      referenceElZIndex.value = referenceElStyle.zIndex
      isReferenceElTransparent.value = referenceElStyle.backgroundColor === 'rgba(0, 0, 0, 0)'
    }

    // Add event listeners when not using the `manual` mode
    if (!props.manual && triggerEl.value instanceof Element) {
      triggerEl.value?.addEventListener(props.trigger ?? 'click', toggle)
    }
  }

  // Watch for element changes
  watch([
    () => props.target,
    () => props.referenceTarget,
  ], () => refreshAnchors())

  // Lifecycle
  onMounted(async () => {
    await nextTick()
    refreshAnchors()
  })

  onBeforeUnmount(() => {
    if (triggerEl.value instanceof Element) {
      triggerEl.value?.removeEventListener(props.trigger ?? 'click', toggle)
    }
  })

  return {
    isReferenceElTransparent,
    referenceElZIndex,
    arrowEl,
    contentEl,
    floatingEl,
    floatingReferenceEl,
    referenceEl,
    refreshAnchors,
  }
}
