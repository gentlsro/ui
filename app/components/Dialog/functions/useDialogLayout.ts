// Types
import type { IDialogProps } from '../types/dialog-props.type'

// Functions
import { useDialogUtils } from './useDialogUtils'

export function useDialogLayout(
  model: Ref<boolean>,
  props: IDialogProps,
  getHost: () => HTMLElement | null | undefined,
) {
  // Utils
  const { getElement } = useDialogUtils()

  // Layout
  const floatingEl = ref<HTMLDivElement>()
  const triggerEl = ref<ReturnType<typeof getElement>>()
  const contentEl = ref<HTMLElement>()
  const dialogWrapperEl = ref<HTMLElement>()

  function toggle() {
    model.value = !model.value
  }

  const isMounted = ref(false)
  onMounted(() => isMounted.value = true)

  // Capture the exact target/event for cleanup. Both can change while mounted;
  // reading the new props during cleanup would leave the old listener attached.
  watchEffect(onCleanup => {
    if (!isMounted.value) {
      return
    }

    const parentEl = getHost() ?? undefined
    const target = getElement({ elRef: props.target ?? parentEl, parentEl })
    const event = props.trigger ?? 'click'
    triggerEl.value = target

    if (!props.manual && target instanceof HTMLElement) {
      target.addEventListener(event, toggle)
      onCleanup(() => target.removeEventListener(event, toggle))
    }
  }, { flush: 'post' })

  return {
    triggerEl,
    contentEl,
    dialogWrapperEl,
    floatingEl,
  }
}
