// Types
import type { IHeadingProps } from '../types/heading-props.type'

export function useHeadingUtils() {
  function getHeadingProps(props: IHeadingProps) {
    return reactivePick(props, ['filled', 'highlighted'])
  }

  return { getHeadingProps }
}
