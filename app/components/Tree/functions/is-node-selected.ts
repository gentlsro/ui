// Types
import type { ITreeNode } from '../types/tree-node.type'
import type { ITreeProps } from '../types/tree-props.type'

export function isNodeSelected(payload: {
  node: ITreeNode
  idKey: ITreeProps['idKey']
  selection: ITreeProps['selection']
}) {
  const { node, selection, idKey = 'id' } = payload

  if (isNil(selection)) {
    return false
  }

  const arraySelected = Array.isArray(selection)
    ? selection
    : [selection]

  const idsSelected = arraySelected
    .map(s => typeof s === 'object' ? get(s, idKey) : s)
    .filter(key => !isNil(key)) as (string | number)[]

  return idsSelected.includes(node.id)
}
