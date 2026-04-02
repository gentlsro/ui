// Types
import type { ITreeNode } from '../types/tree-node.type'
import type { ITreeProps } from '../types/tree-props.type'

export function isNodeSelected(payload: {
  node: ITreeNode
  idKey: ITreeProps['idKey']
  selection: ITreeProps['selection']
  selectionConfig: ITreeProps['selectionConfig']
}) {
  const { node, selection, selectionConfig, idKey = 'id' } = payload

  if (selectionConfig?.isNodeSelected) {
    return selectionConfig.isNodeSelected({ node, selection })
  }

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
