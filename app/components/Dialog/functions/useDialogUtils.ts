// Types
import type { IDialogProps } from '../types/dialog-props.type'

export function useDialogUtils() {
  const { getElement } = useFloatingUIUtils()

  function getMenuProps(props: IDialogProps) {
    return reactivePick(props, [
      'beforeHideFnc',
      'dense',
      'manual',
      'maxHeight',
      'modelValue',
      'noOverlay',
      'persistent',
      'position',
      'title',
      'transitionDuration',
      'target',
    ])
  }

  return {
    getMenuProps,
    getElement,
  }
}
