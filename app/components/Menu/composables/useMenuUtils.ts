// Types
import type { IMenuProps } from '../types/menu-props.type'

export function useMenuUtils() {
  function getMenuProps(props: IMenuProps) {
    return reactivePick(props, [
      'beforeHideFnc',
      'cover',
      'dense',
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
      'virtualConfig',
      'virtualDimensions',
    ])
  }

  return { getMenuProps }
}
