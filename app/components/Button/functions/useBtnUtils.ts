// Types
import type { IBtnNavigationProps, IBtnProps } from '../types/btn-props.type'

type IBtnOrNuxtLinkResolverPickSource = Pick<
  IBtnProps,
  keyof IBtnNavigationProps
>

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

  function getBtnOrNuxtLinkResolverProps(props: IBtnOrNuxtLinkResolverPickSource) {
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
    ])
  }

  return {
    getBtnProps,
    getBtnOrNuxtLinkResolverProps,
  }
}
