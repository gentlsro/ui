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

// Layout
const draggableEl = useTemplateRef<{ element?: HTMLElement }>('draggableEl')

// D'n'D
let clonedElement: HTMLElement | null = null

// Distance from the pointer to the row's top, kept while dragging
let pointerOffsetY = 0
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
      pointerOffsetY = element.getBoundingClientRect().top - drag.startEvent.y
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

  // Reordering only depends on the hovered row, so the ghost keeps its column
  // and follows the pointer vertically (a wide row has no room to move sideways)
  const maxTop = window.innerHeight - clonedElement.offsetHeight
  clonedElement.style.top = `${Math.max(0, Math.min(pos.y + pointerOffsetY, maxTop))}px`
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
  const source = draggableElement.value
  clonedElement = source?.cloneNode(true) as HTMLElement

  if (!clonedElement) {
    return
  }

  const { x: clientX, y: clientY } = pos
  const rect = source!.getBoundingClientRect()

  // Fixed to the viewport (like the Tree's ghost), so page or dialog scroll
  // cannot offset it; its margin is dropped so it sits exactly over the row
  Object.assign(clonedElement.style, {
    position: 'fixed',
    margin: '0',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: '9999',
    pointerEvents: 'none',
  })

  // Floating card look (no tree lines), see the unscoped style below
  clonedElement.classList.add('is-ghost')
  document.body.appendChild(clonedElement)

  draggedItem.value = {
    row: props.item,
    pos: { x: clientX, y: clientY },
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

<style lang="scss">
// The floating copy while dragging: a lifted card without the tree lines
.qb-row.is-ghost {
  @apply opacity-90 shadow-lg bg-white dark:bg-darker;

  &::before,
  &::after {
    display: none;
  }
}
</style>
