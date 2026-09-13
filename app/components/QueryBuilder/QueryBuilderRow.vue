<script setup lang="ts" vapor>
import { Draggable, PointerSensor } from 'dragdoll'
// Types
import type { IQueryBuilderGroup } from './types/query-builder-group-props.type'
import type { IQueryBuilderRowProps } from './types/query-builder-row-props.type'

// Store
import { useQueryBuilderStore } from './query-builder.store'

defineOptions({ inheritAttrs: false })

const props = defineProps<IQueryBuilderRowProps>()

// Store
const { items, draggedItem, queryBuilderEl } = useQueryBuilderStore()

// Constants
const ITEM_ROW_LEFT_MARGIN = 20

// Layout
const draggableEl = useTemplateRef<{ element?: HTMLElement }>('draggableEl')

// D'n'D
let clonedElement: HTMLElement | null = null
let mouseOffset = { x: 0, y: 0 }
let pointerPosition: { x: number, y: number } | undefined
let autoScrollFrame: number | undefined

const draggableElement = computed(
  () => draggableEl.value?.element,
)

// The row's exposed root is replaced when its item/group branch changes.
watch(draggableElement, (element, _, onCleanup) => {
  if (!element) {
    return
  }
  const sensor = new PointerSensor(element, {
    sourceEvents: 'pointer',
    cancelOnEscape: true,
    startPredicate: event => {
      if (!(event instanceof PointerEvent) || event.button !== 0
        || !(event.target instanceof Element)
        || event.target.closest('.qb-row') !== element
        || !event.target.closest('.query-builder-move-handler')) {
        return false
      }
      event.preventDefault()

      return true
    },
  })
  const draggable = new Draggable([sensor], {
    elements: () => [],
    startPredicate: () => true,
    onStart: drag => {
      const rect = element.getBoundingClientRect()
      mouseOffset = {
        x: rect.left - drag.startEvent.x - ITEM_ROW_LEFT_MARGIN,
        y: rect.top - drag.startEvent.y,
      }
      cloneElement(drag.startEvent)
    },
    // Dragdoll samples movement in RAF; the clone and target update together.
    onMove: drag => updateDragPosition(drag.moveEvent),
    onEnd: drag => {
      const commit = drag.endEvent?.type === 'end'
      if (commit && drag.endEvent) {
        updateDragPosition(drag.endEvent)
      }
      finishDrag(commit)
    },
  })
  onCleanup(() => {
    stopAutoScroll()
    sensor.cancel()
    draggable.destroy()
    sensor.destroy()
  })
}, { immediate: true, flush: 'post' })

function updateDragPosition(pos: { x: number, y: number }) {
  if (!clonedElement || !draggedItem.value) {
    return
  }

  const maxLeft = window.innerWidth - clonedElement.offsetWidth - ITEM_ROW_LEFT_MARGIN
  const maxTop = window.innerHeight - clonedElement.offsetHeight
  clonedElement.style.left = `${Math.max(0, Math.min(pos.x + mouseOffset.x, maxLeft))}px`
  clonedElement.style.top = `${Math.max(0, Math.min(pos.y + mouseOffset.y, maxTop))}px`
  // Dragdoll reuses its event object; snapshot coordinates so each frame notifies the target watcher.
  draggedItem.value.pos = { x: pos.x, y: pos.y }
  pointerPosition = pos
  startAutoScroll()
}

function startAutoScroll() {
  if (autoScrollFrame === undefined) {
    autoScrollFrame = requestAnimationFrame(handleAutoScroll)
  }
}

function stopAutoScroll() {
  if (autoScrollFrame !== undefined) {
    cancelAnimationFrame(autoScrollFrame)
    autoScrollFrame = undefined
  }
  pointerPosition = undefined
}

function handleAutoScroll() {
  autoScrollFrame = undefined
  const scroller = queryBuilderEl.value
  const pos = pointerPosition

  if (!clonedElement || !draggedItem.value || !scroller || !pos) {
    return
  }

  const threshold = 40
  const bounds = scroller.getBoundingClientRect()
  const getDelta = (position: number, start: number, end: number) => {
    if (position < start + threshold) {
      return -Math.ceil((start + threshold - position) / 3)
    }
    if (position > end - threshold) {
      return Math.ceil((position - (end - threshold)) / 3)
    }

    return 0
  }
  const left = scroller.scrollLeft + getDelta(pos.x, bounds.left, bounds.right)
  const top = scroller.scrollTop + getDelta(pos.y, bounds.top, bounds.bottom)

  scroller.scrollTo(left, top)
  autoScrollFrame = requestAnimationFrame(handleAutoScroll)
}

// Cancellation removes the clone without committing a pending drop.
function finishDrag(commit: boolean) {
  stopAutoScroll()
  if (clonedElement) {
    clonedElement.remove()
    clonedElement = null
  }

  // Handle the drag result
  if (commit && draggedItem.value) {
    const { newPath, dropDirection, newPathIsGroup } = draggedItem.value

    if (newPath && dropDirection) {
      const movedItem = draggedItem.value.row
      const currentParentPath = movedItem.path.split('.').slice(0, -2).join('.')
      const currentParent = props.parent ?? get(toValue(items), currentParentPath) as IQueryBuilderGroup
      const currentIndex = currentParent.children.findIndex(child => child.id === movedItem.id)

      const parentPath = newPathIsGroup
        ? newPath
        : newPath.split('.').slice(0, -2).join('.')
      const parent = get(toValue(items), parentPath) as IQueryBuilderGroup
      let insertionIndex = newPathIsGroup
        ? dropDirection === 'below' ? parent.children.length : 0
        : Number(newPath.split('.').at(-1)) + (dropDirection === 'below' ? 1 : 0)

      // Removing an earlier sibling shifts the insertion slot by one.
      if (parent === currentParent && currentIndex < insertionIndex) {
        insertionIndex--
      }
      const [extracted] = currentParent.children.splice(currentIndex, 1)
      parent.children.splice(insertionIndex, 0, extracted!)

      // We update the paths for the structure
      updatePaths()
    }
  }

  draggedItem.value = undefined
}

/**
 * Clones an element and positions it on the mouse cursor
 */
function cloneElement(pos: { x: number, y: number }) {
  clonedElement = draggableElement.value?.cloneNode(true) as HTMLElement

  if (clonedElement) {
    const { x: clientX, y: clientY } = pos

    clonedElement.style.position = 'absolute'
    clonedElement.style.left = `${clientX + mouseOffset.x}px`
    clonedElement.style.top = `${clientY + mouseOffset.y}px`
    clonedElement.style.width = `${draggableElement.value!.offsetWidth}px`
    clonedElement.style.height = `${draggableElement.value!.offsetHeight}px`
    clonedElement.style.zIndex = '9999'
    clonedElement.style.opacity = '0.5'
    clonedElement.style.pointerEvents = 'none'
    document.body.appendChild(clonedElement)

    draggedItem.value = {
      row: props.item,
      pos: { x: clientX, y: clientY },
    }
  }
}

/**
 * Update paths of the items structure, when no `parent` is provided, it updates
 * the paths of the whole structure
 */
function updatePaths(parent?: IQueryBuilderGroup) {
  const _parent = parent ?? (toValue(items)[0] as IQueryBuilderGroup)

  _parent.children.forEach((child, idx) => {
    child.path = `${_parent.path}.children.${idx}`

    if ('isGroup' in child) {
      updatePaths(child)
    }
  })
}
</script>

<template>
  <QueryBuilderGroup
    v-if="'isGroup' in item"
    ref="draggableEl"
    :item
    :level
    :parent
    :is-last-child
    :no-add
    :no-condition-change
    :editable
    :remove-fnc
    v-bind="$attrs"
    @delete:row="updatePaths()"
  />

  <QueryBuilderItem
    v-else
    ref="draggableEl"
    :item
    :level
    :parent
    :is-last-child
    :no-add
    :editable
    :remove-fnc
    :modify-fnc
    v-bind="$attrs"
    @delete:row="updatePaths()"
  />
</template>
