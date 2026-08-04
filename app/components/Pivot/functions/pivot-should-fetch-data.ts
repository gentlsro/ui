import type { IPivotProps } from '../types/pivot-props.type'

export function shouldFetchPivotData<T>(
  props: Pick<IPivotProps<T>, 'data' | 'loadData'>,
  phase: 'setup' | 'mounted',
) {
  if (!props.loadData?.fnc || props.data !== undefined) {
    return false
  }

  return phase === 'setup'
    ? !!props.loadData.immediate
    : !props.loadData.immediate
}
