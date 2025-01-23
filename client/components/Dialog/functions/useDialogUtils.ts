// Types
import type { IDialogProps } from '../types/dialog-props.type'

// Functions
import { useFloatingUIUtils } from '../../FloatingUI/functions/useFloatingUIUtils'

export function useDialogUtils() {
  const { getElement } = useFloatingUIUtils()

  function getMenuProps(props: IDialogProps) {
    return reactivePick(props, [
      'beforeHideFnc',
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
