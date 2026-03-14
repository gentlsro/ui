import { render } from 'vue'
import type { MaybeElementRef } from '@vueuse/core'

// Types
import type { IDialogProps } from '../components/Dialog/types/dialog-props.type'

// Components
import Dialog from '../components/Dialog/Dialog.vue'

export function useDialog() {
  const self = getCurrentInstance()

  function createDialog(
    props: IDialogProps & IItem,
    options?: {
      children?: any
      elRef?: MaybeElementRef
    },
  ) {
    const { children, elRef } = options ?? {}

    const el = unrefElement(elRef)

    const { vueApp } = useNuxtApp()
    let _el = el ?? (self!.vnode.el as HTMLElement | null)

    if (!_el) {
      return
    }

    const dialogEl = h(
      Dialog,
      {
        ...props,
        modelValue: true,
        manual: true,
        onHide: () => {
          props?.onHide?.()

          setTimeout(() => {
            render(null, _el!)
            _el = null
          }, 0)
        },
      },
      children,
    )

    dialogEl.appContext = vueApp._context
    render(dialogEl, _el!)
  }

  return { createDialog }
}
