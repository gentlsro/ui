// Types
import type { IBtnProps } from '../types/btn-props.type'

export function useBtnUtils() {
  function getBtnProps(props: IBtnProps) {
    return reactivePick(props, [
      'disabled',
      'download',
      'exact',
      'external',
      'navigateToOptions',
      'noActiveLink',
      'noUnderline',
      'to',
      'type',
      'size',
      'icon',
      'label',
      'labelBreakpoint',
      'loaderVariant',
      'loading',
      'loadingColor',
      'name',
      'noBold',
      'noDim',
      'noHoverEffect',
      'noUppercase',
      'noTruncate',
      'outlined',
      'round',
      'rounded',
    ])
  }

  return {
    getBtnProps,
  }
}
