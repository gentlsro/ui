// Functions
import { treeCollapseAll } from './tree-collapse-all'
import { treeExpandAll } from './tree-expand-all'

// Store
import { useTreeStore } from '../stores/tree.store.new'

export function treeGetExposed() {
  const treeStore = useTreeStore()
  const { nodesFlattened, searchEl } = treeStore

  return {
    nodesFlattened,
    focusSearch: () => searchEl.value?.focus(),
    selectSearch: () => searchEl.value?.select(),
    clearSearch: () => searchEl.value?.clear(),
    collapseAll: treeCollapseAll,
    expandAll: treeExpandAll,
    store: () => treeStore,
  }
}
