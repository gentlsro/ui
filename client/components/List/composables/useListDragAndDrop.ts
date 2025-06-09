// @unocss-include

import { autoScrollPlugin, Draggable, PointerSensor } from 'dragdoll'
import type { PointerSensorMoveEvent } from 'dragdoll'
import { moveItem } from '$utils'

// Types
import type { IListItem } from '../types/list-item.type'

// Store
import { useListStore } from '../stores/list.store'
import { getListItemKey } from '../functions/helpers'

const LIST_ITEM_CLASSES = ['list-row-item', 'list-row-group']

export function useListDragAndDrop() {
  // Store
  const {
    listEl,
    items,
    listItems,
    draggedItem,
    dragMeta,
    itemKey,
    emits,
  } = storeToRefs(useListStore())

  // Utils
  let lastY = 0
  const { x, y } = useSharedMouse()

  function handleDragStart(payload: { item: IListItem, el: HTMLElement }) {
    // Get the list padding top to calculate the correct position of drop indicator
    const listElDom = unrefElement(listEl as any) as HTMLElement

    if (listElDom) {
      const listPaddingTop = getComputedStyle(listElDom).paddingTop

      dragMeta.value.dropIndicatorCSS = { top: listPaddingTop }
    }

    draggedItem.value = payload.item
    dragMeta.value = {
      ...dragMeta.value,
      sourceRect: payload.el.getBoundingClientRect(),
      sourceEl: payload.el as HTMLElement,
    }

    if (listElDom) {
      const items = listElDom.querySelectorAll('.content-row') as NodeListOf<HTMLElement>

      items.forEach(item => {
        item.style.transition = 'transform 125ms linear'
        item.style.setProperty('--translate3D', '0, 0, 0')
      })
    }
  }

  function handleDragMove(ev: Pick<PointerSensorMoveEvent, 'x' | 'y' | 'target'>, delta = 0) {
    const { x, y, target } = ev
    lastY = y
    const elements = document.elementsFromPoint(x, y)
    const listElDom = unrefElement(listEl as any) as HTMLElement

    const draggedOverItem = elements.find(el => {
      return LIST_ITEM_CLASSES.some(cls => el.classList.contains(cls))
    }) as HTMLElement

    // If we're over a previous item, we don't do anything
    const draggedOverItemId = draggedOverItem?.dataset.id
    const isDraggedOverSameItem = draggedOverItemId === dragMeta.value?.target?.id
    const isSelf = draggedOverItemId === String(draggedItem.value?.id)
    const {
      y: draggedOverItemY,
      height: draggedOverItemHeight,
    } = draggedOverItem?.getBoundingClientRect() ?? {}

    let isAbove = y <= (draggedOverItemY + draggedOverItemHeight / 2)

    if (!dragMeta.value.isVirtualScroll && delta) {
      const isMovingUp = delta < 0

      if (isMovingUp && !isAbove) {
        isAbove = y <= (draggedOverItemY + draggedOverItemHeight / 4 * 3)
      } else if (!isMovingUp && isAbove) {
        isAbove = y <= (draggedOverItemY + draggedOverItemHeight / 4)
      }
    }

    const isSamePlacement = dragMeta.value?.placement === (isAbove ? 'above' : 'below')
    const isSame = isDraggedOverSameItem && isSamePlacement

    if (isSelf || isSame || !draggedOverItem || !draggedItem.value) {
      return
    }

    const t = (target as HTMLElement)?.closest('.content-row') as HTMLElement

    if (!t) {
      return
    }
    const targetIdx = Number(t?.getAttribute('data-idx'))

    requestAnimationFrame(() => {
      // When virtual scroll is used, we use the drop indicator
      if (dragMeta.value.isVirtualScroll) {
        const computedStyle = getComputedStyle(t)
        const tHeight = +computedStyle.getPropertyValue('--rowHeight')
        const tTranslateY = +computedStyle.getPropertyValue('--translateY')

        dragMeta.value.dropIndicatorCSS = Object.assign(
          {},
          dragMeta.value.dropIndicatorCSS,
          { '--translateY': isAbove ? (tTranslateY) : `${tTranslateY + tHeight}` },
        )
      }

      // Otherwise, we animate the changes through the translate3d property
      else if (!isNil(draggedItem.value?.index)) {
        let moveSelf = 0

        // Moving up
        if (targetIdx < draggedItem.value!.index) {
          const [idxStart, idxEnd] = [isAbove ? targetIdx : targetIdx + 1, draggedItem.value!.index]

          listItems.value.forEach((item, idx) => {
            const isPreceedingItem = idx >= idxStart && idx < idxEnd
            const el = (listElDom.querySelector(`[data-id="${item.id}"]`) as HTMLElement)
              ?.closest('.content-row') as HTMLElement

            if (isPreceedingItem && el) {
              el.style.setProperty('--translate3D', `0, ${dragMeta.value.sourceRect?.height}px, 0`)

              const computedStyle = getComputedStyle(el)
              const elHeight = +computedStyle.getPropertyValue('--rowHeight')
              moveSelf -= elHeight
            } else if (el) {
              el.style.setProperty('--translate3D', '0, 0, 0')
            }
          })
        }

        // Moving down
        else {
          const [idxStart, idxEnd] = [draggedItem.value!.index + 1, isAbove ? targetIdx : targetIdx + 1]

          listItems.value.forEach((item, idx) => {
            const isFollowingItem = idx >= idxStart && idx < idxEnd
            const el = (listElDom.querySelector(`[data-id="${item.id}"]`) as HTMLElement)
              ?.closest('.content-row') as HTMLElement

            if (isFollowingItem && el) {
              el.style.setProperty('--translate3D', `0, -${dragMeta.value.sourceRect?.height}px, 0`)

              const computedStyle = getComputedStyle(el)
              const elHeight = +computedStyle.getPropertyValue('--rowHeight')
              moveSelf += elHeight
            } else if (el) {
              el.style.setProperty('--translate3D', '0, 0, 0')
            }
          })
        }

        // Move the item itself
        const selfDom = (listElDom.querySelector(`[data-id="${draggedItem.value?.id}"]`) as HTMLElement)
          ?.closest('.content-row') as HTMLElement
        if (selfDom) {
          selfDom.style.setProperty('--translate3D', `0, ${moveSelf}px, 0`)
        }
      }

      dragMeta.value.placement = isAbove ? 'above' : 'below'
      dragMeta.value.targetEl = t
      dragMeta.value.target = listItems.value?.find(item => String(item.id) === String(draggedOverItem.dataset.id))
    })
  }

  function handleDragEnd(drag?: Draggable['drag']) {
    const dragItem = drag?.items[0]

    // Remove the ghost element.
    dragItem?.element.remove()

    const targetId = dragMeta.value.target?.id
    const fromIdx = items.value.findIndex(item => {
      return getListItemKey(item, itemKey.value) === draggedItem.value?.id
    })

    let toIdx = items.value.findIndex(item => {
      return getListItemKey(item, itemKey.value) === targetId
    })

    // We need to adjust the `toIdx` based on the direction and placement
    const isMovedUp = toIdx < fromIdx

    if (isMovedUp && dragMeta.value.placement === 'below') {
      toIdx = toIdx + 1
    } else if (!isMovedUp && dragMeta.value.placement === 'above') {
      toIdx = toIdx - 1
    }

    if (drag && !!dragMeta.value.target?.id) {
      items.value = moveItem(items.value, fromIdx, toIdx)
      emits.value.itemMoved(draggedItem.value!.ref, items.value)
    }

    // Reset dragging
    draggedItem.value = undefined
    dragMeta.value = {
      targetEl: undefined,
      target: undefined,
      placement: undefined,
      dropIndicatorCSS: undefined,
      sourceEl: undefined,
    }

    const listElDom = unrefElement(listEl as any) as HTMLElement

    if (listElDom) {
      const items = listElDom.querySelectorAll('.content-row') as NodeListOf<HTMLElement>

      items.forEach(item => {
        item.style.transition = ''
        item.style.setProperty('--translate3D', '0, 0, 0')
      })
    }
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

  function handleScroll() {
    requestAnimationFrame(() => {
      handleDragMove({
        x: x.value,
        y: y.value,
        target: document.elementFromPoint(x.value, y.value),
      })
    })
  }

  function createDraggable(payload: {
    el: HTMLElement
    containerEl: HTMLElement
    itemId: IListItem['id']
    moveHandleEl: HTMLElement
  }) {
    const { el, containerEl, itemId, moveHandleEl } = payload

    if (!moveHandleEl) {
      return
    }

    const pointerSensor = new PointerSensor(moveHandleEl)
    const draggable = new Draggable([pointerSensor], {
      elements: () => {
        const listElDom = unrefElement(listEl as any) as HTMLElement
        dragMeta.value.isVirtualScroll = !!listElDom?.classList.contains('is-virtual')
        const clone = createClone(el)

        return [clone]
      },
      frozenStyles: () => ['left', 'top'],
      onStart: drag => {
        lastY = drag.startEvent.y
        const item = listItems.value.find(item => item.id === itemId) as IListItem
        containerEl.addEventListener('scroll', handleScroll)
        containerEl.classList.add('hide-scrollbar')

        handleDragStart({ item, el })
      },
      onMove: drag => handleDragMove(drag.moveEvent as PointerSensorMoveEvent, drag.moveEvent.y - lastY),
      onEnd: drag => {
        containerEl.removeEventListener('scroll', handleScroll)
        containerEl.classList.remove('hide-scrollbar')

        handleDragEnd(drag)
      },
    }).use(autoScrollPlugin({
      speed: (_, { distance, threshold }) => {
        const x = Math.min(threshold, threshold - distance) / threshold

        return x * 450
      },
      targets: [
        {
          element: containerEl,
          axis: 'y',
          padding: { top: Infinity, bottom: Infinity },
          threshold: 50,
        },
      ],
    }))

    return draggable
  }

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    createClone,
    createDraggable,
  }
}
