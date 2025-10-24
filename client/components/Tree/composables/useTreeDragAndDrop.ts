import { autoScrollPlugin, Draggable, PointerSensor } from 'dragdoll'
import type { PointerSensorMoveEvent } from 'dragdoll'

// Store
import { useTreeStore } from '../stores/tree.store'

const TREE_NODE_CLASSES = ['tree-node']

export function useTreeDragAndDrop() {
  // Store
  const treeStore = useTreeStore()
  const { treeEl, draggedNode, dragMeta, nodeById, dndConfig, nodeMetaById } = storeToRefs(treeStore)

  // Utils
  const { x, y } = useSharedMouse()
  let lastY = 0
  let startMousePosition = { x: 0, y: 0 }

  function handleDragStart(payload: { item: ITreeNode, el: HTMLElement }) {
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

    const draggedOverItem = elements.find(el => {
      return TREE_NODE_CLASSES.some(cls => el.classList.contains(cls))
    }) as HTMLElement

    const draggedOverItemId = draggedOverItem?.dataset.id
    const isDraggedOverSameItem = draggedOverItemId === dragMeta.value?.target?.id
    const isSelf = draggedOverItemId === String(draggedNode.value?.id)

    if (isSelf || !draggedNode.value) {
      dragMeta.value.target = null

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
        dragMeta.value.target = { id: '__ROOT__' }
        dragMeta.value.dropAllowed = dndConfig.value?.canBeDropped?.({
          draggedNode: draggedNode.value!,
          nodeById: nodeById.value,
          nodeMetaById: nodeMetaById.value,
        }) ?? true
      }

      return
    }

    const t = (target as HTMLElement)?.closest('.content-row') as HTMLElement

    if (!t) {
      return
    }

    requestAnimationFrame(() => {
      const computedStyle = getComputedStyle(t)
      const tHeight = +computedStyle.getPropertyValue('--rowHeight')
      const tTranslateY = +computedStyle.getPropertyValue('--translateY')

      dragMeta.value.dropIndicatorCSS = Object.assign(
        {},
        dragMeta.value.dropIndicatorCSS,
        { '--translateY': isAbove ? (tTranslateY) : `${tTranslateY + tHeight}` },
      )

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

      // Drop mode = 'parent'
      // = we highlight the parent node
      if (dndConfig.value?.dropMode === 'parent') {
        const parent = dndConfig.value?.getParentNode?.({
          draggedNode: draggedNode.value!,
          targetNode: treeNode,
          nodeById: nodeById.value,
          nodeMetaById: nodeMetaById.value,
        })

        if (parent) {
          dragMeta.value.target = parent
        } else {
          dragMeta.value.target = { id: '__ROOT__' }
        }
      }

      // Drop mode = 'place'
      // = we use the drop indicator and placement (above or below)
      else {
        dragMeta.value.placement = isAbove ? 'above' : 'below'
        dragMeta.value.targetEl = t
        dragMeta.value.target = treeNode
      }
    })
  }

  function handleDragEnd(drag?: Draggable['drag']) {
    const dragItem = drag?.items[0]

    // Turn on selection
    getSelection()?.removeAllRanges()
    document.documentElement.classList.remove('select-none')

    // Remove the ghost element.
    dragItem?.element.remove()

    // Resolve the drag
    if (dragMeta.value?.target) {
      treeStore.moveNode({
        node: draggedNode.value!,
        to: dragMeta.value.target,
      })
    }

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

  function createDraggable(payload: {
    el: HTMLElement
    item: ITreeNode
  }) {
    const { el, item } = payload
    const treeElDom = unrefElement(treeEl) as HTMLElement

    const pointerSensor = new PointerSensor(el)
    const draggable = new Draggable([pointerSensor], {
      elements: () => [createClone(el)],
      frozenStyles: () => ['left', 'top'],
      onStart: drag => {
        lastY = drag.startEvent.y
        treeElDom.addEventListener('scroll', handleScroll)
        treeElDom.classList.add('hide-scrollbar')

        handleDragStart({ item, el })
      },
      onMove: drag => handleDragMove(drag.moveEvent as PointerSensorMoveEvent, drag.moveEvent.y - lastY),
      onEnd: drag => {
        treeElDom.removeEventListener('scroll', handleScroll)
        treeElDom.classList.remove('hide-scrollbar')

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
