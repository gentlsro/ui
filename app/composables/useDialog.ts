import type { Component } from 'vue'
import type { IDialogProps } from '../components/Dialog/types/dialog-props.type'

export type DialogEntry = {
  id: number
  open: boolean
  props: IDialogProps & IItem
  children: Record<string, Component>
  finish: () => void
}

/** @vapor-ready Render the returned dialogs in a DialogHost under this owner. */
export function useDialog() {
  const dialogs = shallowRef<DialogEntry[]>([])
  let nextId = 0
  let disposed = false

  onScopeDispose(() => {
    disposed = true
    dialogs.value = []
  })

  function createDialog(
    props: IDialogProps & IItem,
    options?: {
      children?: Record<string, Component>
      /** Explicit DOM target; component-root discovery is intentionally unsupported. */
      elRef?: IDialogProps['target']
    },
  ) {
    if (import.meta.server || disposed) {
      return
    }

    const { onHide, ...dialogProps } = props
    const entry: DialogEntry = shallowReactive({
      id: nextId++,
      open: true,
      props: { ...dialogProps, target: options?.elRef ?? props.target },
      children: options?.children ?? {},
      finish: () => {
        if (!dialogs.value.includes(entry)) {
          return
        }

        dialogs.value = dialogs.value.filter(dialog => dialog !== entry)
        onHide?.()
      },
    })
    dialogs.value = [...dialogs.value, entry]

    return {
      close: async () => {
        if (disposed || !entry.open) {
          return
        }

        if ((await entry.props.beforeHideFnc?.()) ?? true) {
          entry.open = false
        }
      },
    }
  }

  return { createDialog, dialogs: computed(() => dialogs.value) }
}
