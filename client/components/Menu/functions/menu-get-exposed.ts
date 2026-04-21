import { useMenuStore } from '../store/menu.store'

export function menuGetExposed(payload: {
  modelHandler: WritableComputedRef<boolean | undefined>
  isChangeForced: Ref<boolean>
  refreshAnchors: () => void
  bounce: () => void
  update: () => void
}) {
  const { modelHandler, isChangeForced, refreshAnchors, bounce, update } = payload

  // Store
  const store = useMenuStore()
  const { floatingEl } = store

  return {
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
    getStore: () => store,
  }
}
