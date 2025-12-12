// Types
import type { ITreeDmsProps } from '../types/tree-dms-props.type'
import type { ITreeNode } from '#layers/ui/client/components/TreeNew/types/tree-node.new.type'

type IConfig<T extends IItem = IItem> = {
  injectionKey?: string
  props?: ITreeDmsProps<T>
}

export const TREE_DMS_INJECTION_KEY = Symbol('tree-dms')

function createStore<T extends IItem = IItem>(injectionKey?: string) {
  const injectionState = createInjectionState((payload?: IConfig<T>) => {
    const { props } = payload ?? {}

    // Utils
    const instance = getCurrentInstance()

    const fileKey = initRef({
      propName: 'fileKey',
      instance,
      props,
      defaultValue: 'file',
    }) as Ref<string>

    const folderKey = initRef({
      propName: 'folderKey',
      instance,
      props,
      defaultValue: 'folder',
    }) as Ref<string>

    const modifiers = ref(props?.modifiers)

    // State
    const nodeSelected = ref<T>()
    const nodeContextMenu = ref<ITreeNode<T>>()
    const isContextMenuOpen = ref(false)
    const nodeEditing = ref<ITreeNode<T>>()
    const isLoadingByNodeId = ref<Record<ITreeNode<T>['id'], boolean>>({})
    const isCurrentlyAddingItem = ref(false)

    const returnedData = {
      // Utils
      fileKey,
      folderKey,
      modifiers,

      // State
      nodeEditing,
      nodeSelected,
      nodeContextMenu,
      isContextMenuOpen,
      isLoadingByNodeId,
      isCurrentlyAddingItem,
    }

    return returnedData
  }, { injectionKey })

  return injectionState
}

export function useTreeDmsStore<T extends IItem = IItem>(payload?: IConfig<T>) {
  let injectionKey = payload?.injectionKey ?? injectLocal(TREE_DMS_INJECTION_KEY)

  if (!injectionKey) {
    const uuid = generateUUID()
    provideLocal(TREE_DMS_INJECTION_KEY, uuid)
    injectionKey = uuid
  }

  const [useProvideTreeDmsStore, useConsumeTreeDmsStore] = createStore<T>(injectionKey)!

  return useConsumeTreeDmsStore() ?? useProvideTreeDmsStore(payload)
}
