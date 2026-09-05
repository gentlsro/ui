import { autoScrollPlugin, Draggable, PointerSensor } from 'dragdoll'
import type { PointerSensorMoveEvent } from 'dragdoll'

// Types
import type { ITreeNode } from '../types/tree-node.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'
import type { ITreeDragMeta } from '../types/tree-drag-meta.type'
import type { ITreeProps } from '../types/tree-props.type'

type IConfig<T extends IItem> = {
  treeEl: Ref<HTMLElement | undefined>
  scrollerEl: Readonly<Ref<{ element?: HTMLElement | null } | undefined>>
  draggedNode: Ref<ITreeNode<T> | undefined>
  dragMeta: Ref<ITreeDragMeta<T>>
  cancelDrag: Ref<boolean>
  activeDraggable: Ref<Draggable | null>
  nodeById: Readonly<Ref<Record<string, ITreeNode<T>>>>
  nodeMetaById: Ref<Record<string, ITreeNodeMeta>>
  dndConfig: Ref<ITreeProps<T>['dndConfig']>
  childrenKey: Readonly<Ref<string>>
  expandNode: (node: ITreeNode<T>) => void
  onMove: (node: ITreeNode<T>, meta: ITreeDragMeta<T>) => void
}

export function useTreeDragAndDrop<T extends IItem>(config: IConfig<T>) {
  const {
    treeEl,
    scrollerEl,
    draggedNode,
    dragMeta,
    cancelDrag,
    activeDraggable,
    nodeById,
    dndConfig,
    nodeMetaById,
    childrenKey,
    expandNode,
    onMove,
  } = config

  // Utils
  const { x, y } = useSharedMouse()
  let scrollFrame = 0
  let cancelActiveDrag: (() => void) | undefined

  onBeforeUnmount(() => cancelActiveDrag?.())
  watch([scrollerEl, nodeById], ([scroller, nodes], [previousScroller]) => {
    if (cancelActiveDrag && (scroller !== previousScroller
      || !nodes[draggedNode.value?.id ?? ''])) {
      cancelActiveDrag()
    }
  }, { flush: 'post' })
  let shouldMove = true
  let startMousePosition = { x: 0, y: 0 }

  // Hover-to-expand collapsed folders
  let hoverExpandTimer: ReturnType<typeof setTimeout> | null = null
  let hoverExpandTargetId: string | number | null = null

  function startHoverExpandTimer(node: ITreeNode<T>) {
    if (hoverExpandTargetId === node.id) {
      return
    }

    clearHoverExpandTimer()

    hoverExpandTargetId = node.id
    hoverExpandTimer = setTimeout(() => {
      expandNode(node)
    }, 800)
  }

  function clearHoverExpandTimer() {
    if (hoverExpandTimer) {
      clearTimeout(hoverExpandTimer)
      hoverExpandTimer = null
    }

    hoverExpandTargetId = null
  }

  function handleDragStart(payload: { item: ITreeNode<T>, el: HTMLElement }) {
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
    ev: Pick<PointerSensorMoveEvent, 'x' | 'y'>,
  ) {
    const { x, y } = ev
    const elements = document.elementsFromPoint(x, y)
    shouldMove = true

    const draggedOverItem = elements.find((el): el is HTMLElement => {
      return el instanceof HTMLElement && !!treeEl.value?.contains(el) && el.classList.contains('tree-node')
    })
    const draggedOverContentRow = draggedOverItem?.closest<HTMLElement>('.content-row')

    const draggedOverItemId = draggedOverItem?.dataset.id
    const draggedOverItemPath = draggedOverItem?.dataset.path
    const isDraggedOverSameItem = draggedOverItemId === dragMeta.value?.target?.id
    const isSelf = draggedOverItemId === String(draggedNode.value?.id)
    const sourcePath = nodeMetaById.value[draggedNode.value?.id ?? '']?.path
    const isInsideSelf = !!sourcePath && draggedOverItemPath?.startsWith(`${sourcePath}.${childrenKey.value}.`)

    if (isSelf || isInsideSelf || !draggedNode.value) {
      clearHoverExpandTimer()
      dragMeta.value.target = null
      dragMeta.value.targetEl = undefined

      shouldMove = false

      return
    }

    if (!draggedOverItem) {
      clearHoverExpandTimer()
      dragMeta.value.targetEl = undefined
      dragMeta.value.target = null
      dragMeta.value.targetParent = { id: '__ROOT__' }
      dragMeta.value.dropAllowed = dndConfig.value?.canBeDropped?.({
        draggedNode: draggedNode.value,
        nodeById: nodeById.value,
        nodeMetaById: nodeMetaById.value,
      }) ?? true

      return
    }

    const {
      y: draggedOverItemY,
      height: draggedOverItemHeight,
    } = draggedOverItem.getBoundingClientRect()

    const isAbove = y <= (draggedOverItemY + draggedOverItemHeight / 2)
    const isSamePlacement = dragMeta.value?.placement === (isAbove ? 'above' : 'below')
    const isSame = isDraggedOverSameItem && isSamePlacement

    if (isSame || !draggedNode.value) {
      // shouldMove = false

      return
    }

    const t = draggedOverContentRow

    if (!t) {
      return
    }

    const targetId = draggedOverItem.dataset.id as string
    const treeNode = nodeById.value?.[targetId]

    const isDropAllowed = dndConfig.value?.canBeDropped?.({
      draggedNode: draggedNode.value!,
      targetNode: treeNode,
      nodeById: nodeById.value,
      nodeMetaById: nodeMetaById.value,
    }) ?? true

    if (!isDropAllowed) {
      clearHoverExpandTimer()
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

    let parent: ITreeNode<T> | null | undefined

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
  }

  function handleDragEnd(drag?: Draggable['drag']) {
    clearHoverExpandTimer()
    cancelAnimationFrame(scrollFrame)

    const root = treeEl.value
    const isDragOutOfTree = !root || !document
      .elementsFromPoint(x.value, y.value)
      .includes(root)

    const dragItem = drag?.items[0]

    // Turn on selection
    getSelection()?.removeAllRanges()
    document.documentElement.classList.remove('select-none')

    // Remove the ghost element.
    dragItem?.element.remove()

    // Resolve the drag
    if (drag && draggedNode.value && !isDragOutOfTree && shouldMove && !cancelDrag.value && dragMeta.value.dropAllowed) {
      onMove(draggedNode.value, { ...dragMeta.value })
    }

    cancelDrag.value = false

    // Clear immediately so a later frame cannot overwrite the next drag session.
    draggedNode.value = undefined
    dragMeta.value = {}
  }

  function handleScroll() {
    cancelAnimationFrame(scrollFrame)
    scrollFrame = requestAnimationFrame(() => {
      handleDragMove({
        x: x.value,
        y: y.value,
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

  function createDraggable(payload: {
    el: HTMLElement
    item: ITreeNode<T>
    onEnd?: () => void
  }) {
    const { el, item, onEnd } = payload
    const scrollElement = scrollerEl.value?.element
    if (!scrollElement) {
      return
    }

    let disposed = false
    let released = false
    let clone: HTMLElement | undefined

    const pointerSensor = new PointerSensor(el)
    const draggable = new Draggable([pointerSensor], {
      elements: () => {
        clone = createClone(el)

        return [clone]
      },
      frozenStyles: () => ['left', 'top'],
      onStart: () => {
        cancelActiveDrag?.()
        cancelActiveDrag = dispose
        scrollElement.addEventListener('scroll', handleScroll)
        scrollElement.classList.add('hide-scrollbar')

        activeDraggable.value = draggable
        handleDragStart({ item, el })
      },
      onMove: drag => handleDragMove(drag.moveEvent as PointerSensorMoveEvent),
      onEnd: drag => {
        onEnd?.()
        scrollElement.removeEventListener('scroll', handleScroll)
        scrollElement.classList.remove('hide-scrollbar')
        activeDraggable.value = null

        cancelActiveDrag = undefined
        handleDragEnd(disposed ? undefined : drag)
        if (released) {
          queueMicrotask(dispose)
        }
      },
      startPredicate: data => {
        if (!dndConfig.value?.enabled) {
          return false
        }

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
          element: scrollElement,
          axis: 'y',
          padding: { top: Infinity, bottom: Infinity },
          threshold: 50,
        },
      ],
    }))

    // Destroying a registration ends Dragdoll's session; cancellation must not move a node.
    function dispose() {
      if (disposed) {
        return
      }

      disposed = true
      draggable.destroy()
      pointerSensor.destroy()
      clone?.remove()
      if (cancelActiveDrag === dispose) {
        cancelActiveDrag = undefined
      }
    }

    return (preserveActive = false) => {
      if (preserveActive && draggable.drag && !draggable.drag.isEnded) {
        released = true
      } else {
        dispose()
      }
    }
  }

  return {
    createDraggable,
  }
}
