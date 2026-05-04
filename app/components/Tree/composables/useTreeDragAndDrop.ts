import { autoScrollPlugin, Draggable, PointerSensor } from 'dragdoll'
import type { PointerSensorMoveEvent } from 'dragdoll'

// Types
import type { ITreeNode } from '../types/tree-node.type'

// Functions
import { moveNode } from '../functions/move-node'

// Store
import { useTreeStore } from '../stores/tree.store'

const TREE_CLASS = ['tree']
const TREE_NODE_CLASSES = ['tree-node']

export function useTreeDragAndDrop() {
  // Store
  const store = useTreeStore()
  const {
    treeEl,
    draggedNode,
    dragMeta,
    cancelDrag,
    nodeById,
    dndConfig,
    nodeMetaById,
    childrenKey,
  } = store

  // Utils
  const { x, y } = useSharedMouse()
  let lastY = 0
  let shouldMove = true
  let startMousePosition = { x: 0, y: 0 }

  // Hover-to-expand collapsed folders
  let hoverExpandTimer: ReturnType<typeof setTimeout> | null = null
  let hoverExpandTargetId: string | number | null = null

  function startHoverExpandTimer(node: ITreeNode) {
    if (hoverExpandTargetId === node.id) {
      return
    }

    clearHoverExpandTimer()

    hoverExpandTargetId = node.id
    hoverExpandTimer = setTimeout(() => {
      store.expandNode(node)
    }, 800)
  }

  function clearHoverExpandTimer() {
    if (hoverExpandTimer) {
      clearTimeout(hoverExpandTimer)
      hoverExpandTimer = null
    }

    hoverExpandTargetId = null
  }

  function handleDragStart<T extends IItem = IItem>(payload: { item: ITreeNode<T>, el: HTMLElement }) {
    // Turn off selection while dragging
    getSelection()?.removeAllRanges()
    document.documentElement.classList.add('select-none')

    startMousePosition = { x: x.value, y: y.value }
    draggedNode.value = payload.item
    dragMeta.value = {
      ...dragMeta.value,
      sourceEl: payload.el,
      sourceRect: payload.el.getBoundingClientRect(),
    }
  }

  function handleDragMove(
    ev: Pick<PointerSensorMoveEvent, 'x' | 'y' | 'target'>,
    delta = 0,
  ) {
    const { x, y, target } = ev
    lastY = y
    const elements = document.elementsFromPoint(x, y)
    shouldMove = true

    const draggedOverItem = elements
      .find(el => el.classList.contains('content-row'))
      ?.children[0] as HTMLElement

    const draggedOverItemId = draggedOverItem?.dataset.id
    const draggedOverItemPath = draggedOverItem?.dataset.path
    const isDraggedOverSameItem = draggedOverItemId === dragMeta.value?.target?.id
    const isSelf = draggedOverItemId === String(draggedNode.value?.id)
    const isInsideSelf = draggedOverItemPath?.startsWith(nodeMetaById.value[draggedNode.value?.id ?? '']?.path ?? '')

    if (isSelf || isInsideSelf || !draggedNode.value) {
      dragMeta.value.target = null
      dragMeta.value.targetEl = undefined

      shouldMove = false

      return
    }

    const {
      y: draggedOverItemY,
      height: draggedOverItemHeight,
    } = draggedOverItem?.getBoundingClientRect() ?? {}

    const isAbove = y <= (draggedOverItemY + draggedOverItemHeight / 2)
    const isSamePlacement = dragMeta.value?.placement === (isAbove ? 'above' : 'below')
    const isSame = isDraggedOverSameItem && isSamePlacement

    if (isSame || !draggedOverItem || !draggedNode.value) {
      if (!draggedOverItem && !isSelf) {
        dragMeta.value.target = null
        dragMeta.value.targetParent = { id: '__ROOT__' }
        dragMeta.value.dropAllowed = dndConfig.value?.canBeDropped?.({
          draggedNode: draggedNode.value!,
          nodeById: nodeById.value,
          nodeMetaById: nodeMetaById.value,
        }) ?? true
      }

      // shouldMove = false

      return
    }

    const t = (target as HTMLElement)?.closest('.content-row') as HTMLElement

    if (!t) {
      return
    }

    requestAnimationFrame(() => {
      const targetId = draggedOverItem.dataset.id as string
      const treeNode = nodeById.value?.[targetId]

      const isDropAllowed = dndConfig.value?.canBeDropped?.({
        draggedNode: draggedNode.value!,
        targetNode: treeNode,
        nodeById: nodeById.value,
        nodeMetaById: nodeMetaById.value,
      }) ?? true

      if (!isDropAllowed) {
        dragMeta.value.dropAllowed = false
        dragMeta.value.target = null

        return
      } else {
        dragMeta.value.dropAllowed = true
      }

      dragMeta.value.placement = isAbove ? 'above' : 'below'
      dragMeta.value.target = treeNode

      if (dndConfig.value?.dropMode === 'place') {
        dragMeta.value.targetEl = t
      }

      // Drop mode = 'place'
      // = we use the drop indicator and placement (above or below)
      const targetNodeMeta = nodeMetaById.value[targetId]
      const computedStyle = getComputedStyle(t)
      const tHeight = +computedStyle.getPropertyValue('--rowHeight')
      const tTranslateY = +computedStyle.getPropertyValue('--translateY')

      dragMeta.value.dropIndicatorCSS = Object.assign(
        {},
        dragMeta.value.dropIndicatorCSS,
        {
          '--translateY': isAbove ? (tTranslateY) : `${tTranslateY + tHeight}`,
          '--left': `${((targetNodeMeta?.level ?? 0) + 1) * 12}px`,
        },
      )

      let parent: ITreeNode | null | undefined

      if (dndConfig.value?.getParentNode) {
        parent = dndConfig.value?.getParentNode?.({
          dragMeta: dragMeta.value,
          draggedNode: draggedNode.value!,
          targetNode: treeNode,
          nodeById: nodeById.value,
          nodeMetaById: nodeMetaById.value,
          childrenKey: childrenKey.value,
        })
      } else if (draggedOverItemId) {
        parent = nodeById.value[draggedOverItemId]
      }

      if (parent) {
        dragMeta.value.targetParent = parent
      } else {
        dragMeta.value.targetParent = { id: '__ROOT__' }
      }

      // Hover-to-expand collapsed nodes
      const nodeToExpand = parent ?? treeNode

      if (nodeToExpand && nodeMetaById.value[nodeToExpand.id]?.isCollapsed) {
        startHoverExpandTimer(nodeToExpand)
      } else {
        clearHoverExpandTimer()
      }
    })
  }

  function handleDragEnd(drag?: Draggable['drag']) {
    clearHoverExpandTimer()

    const isDragOutOfTree = !document
      .elementsFromPoint(x.value, y.value)
      .some(el => TREE_CLASS.some(cls => el.classList.contains(cls)))

    const dragItem = drag?.items[0]

    // Turn on selection
    getSelection()?.removeAllRanges()
    document.documentElement.classList.remove('select-none')

    // Remove the ghost element.
    dragItem?.element.remove()

    // Resolve the drag
    if (draggedNode.value && !isDragOutOfTree && shouldMove && !cancelDrag.value) {
      moveNode({
        mode: dndConfig.value?.dropMode ?? 'parent',
        dragMeta: dragMeta.value,
        nodeToMove: draggedNode.value,
        getStore: () => store,
      })
    }

    cancelDrag.value = false

    // Reset dragging
    requestAnimationFrame(() => {
      draggedNode.value = undefined
      dragMeta.value = {
        targetEl: undefined,
        target: undefined,
        placement: undefined,
        dropIndicatorCSS: undefined,
        sourceEl: undefined,
      }
    })
  }

  function handleScroll() {
    requestAnimationFrame(() => {
      handleDragMove({
        x: x.value,
        y: y.value,
        target: document.elementFromPoint(x.value, y.value),
      })
    })
  }

  function createClone(el: HTMLElement) {
    const elemRect = el.getBoundingClientRect()
    const clone = el.cloneNode(true) as HTMLElement
    clone.style.zIndex = '9999'
    clone.style.position = 'fixed'
    clone.style.width = `${elemRect.width}px`
    clone.style.height = `${elemRect.height}px`
    clone.style.left = `${elemRect.left}px`
    clone.style.top = `${elemRect.top}px`

    // Add the ghost and dragging class to the clone. The ghost element will be
    // in dragging state for the duration of it's existence.
    clone.classList.add('ghost', 'dragging', 'pointer-events-none')

    // We need to reset the transform to avoid the ghost element being offset
    // unintentionally. In this specific case, if we don't reset the transform,
    // the ghost element will be offset by the original element's transform.
    clone.style.transform = ''

    // Append the ghost element to the body.
    document.body.appendChild(clone)

    return clone
  }

  function handleMouseMovePredicate(payload: { x: number, y: number }): boolean | undefined {
    const { x, y } = payload

    const diffX = Math.abs(x - startMousePosition.x)
    const diffY = Math.abs(y - startMousePosition.y)
    const pyth = Math.sqrt(diffX ** 2 + diffY ** 2)

    if (pyth > 3) {
      return true
    }

    return undefined
  }

  function createDraggable<T extends IItem = IItem>(payload: {
    el: HTMLElement
    item: ITreeNode<T>
    onEnd?: () => void
  }) {
    const { el, item, onEnd } = payload
    const treeElDom = unrefElement(treeEl) as HTMLElement

    const pointerSensor = new PointerSensor(el)
    const draggable = new Draggable([pointerSensor], {
      elements: () => [createClone(el)],
      frozenStyles: () => ['left', 'top'],
      onStart: drag => {
        lastY = drag.startEvent.y
        treeElDom.addEventListener('scroll', handleScroll)
        treeElDom.classList.add('hide-scrollbar')

        store.activeDraggable.value = draggable
        handleDragStart({ item, el })
      },
      onMove: drag => handleDragMove(drag.moveEvent as PointerSensorMoveEvent, drag.moveEvent.y - lastY),
      onEnd: drag => {
        onEnd?.()
        treeElDom.removeEventListener('scroll', handleScroll)
        treeElDom.classList.remove('hide-scrollbar')
        store.activeDraggable.value = null

        handleDragEnd(drag)
      },
      startPredicate: data => {
        const { x, y, type } = data.event

        if (type === 'start') {
          startMousePosition = { x, y }
        }

        return handleMouseMovePredicate({ x, y })
      },
    }).use(autoScrollPlugin({
      speed: (_, { distance, threshold }) => {
        const x = Math.min(threshold, threshold - distance) / threshold

        return x * 450
      },
      targets: [
        {
          element: treeElDom,
          axis: 'y',
          padding: { top: Infinity, bottom: Infinity },
          threshold: 50,
        },
      ],
    }))

    return draggable
  }

  return {
    createDraggable,
  }
}
