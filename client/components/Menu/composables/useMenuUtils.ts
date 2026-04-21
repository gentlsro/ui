// Types
import type { IMenuProps } from '../types/menu-props.type'

// Functions
import { useFloatingUIUtils } from '../../FloatingUI/functions/useFloatingUIUtils'

export function useMenuUtils() {
  function getMenuProps(props: IMenuProps) {
    return reactivePick(props, [
      'beforeHideFnc',
      'cover',
      'fallbackPlacements',
      'fit',
      'manual',
      'matchWidth',
      'maxHeight',
      'modelValue',
      'noArrow',
      'noOverlay',
      'noUplift',
      'offset',
      'persistent',
      'placement',
      'title',
      'transitionDuration',
      'target',
      'referenceTarget',
      'virtualConfiguration',
      'virtualDimensions',
    ])
  }

  return { getMenuProps }
}
