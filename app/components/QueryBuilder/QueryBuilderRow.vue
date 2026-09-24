<script setup lang="ts">
// Types
import type { IQueryBuilderGroup } from './types/query-builder-group-props.type'
import type { IQueryBuilderRowProps } from './types/query-builder-row-props.type'

// Store
import { useQueryBuilderStore } from './query-builder.store'

// Components
import type QueryBuilderItem from './QueryBuilderItem.vue'
import type QueryBuilderGroup from './QueryBuilderGroup.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<IQueryBuilderRowProps>()

// Store
const { items, draggedItem, queryBuilderEl } = useQueryBuilderStore()

// Layout
const draggableEl = ref<InstanceType<typeof QueryBuilderGroup | typeof QueryBuilderItem>>()

// Scrolling
const scrollBy = ref({ speedX: 0, speedY: 0 })

const { pause, resume, isActive } = useIntervalFn(
  () => {
    const { speedX, speedY } = scrollBy.value
    queryBuilderEl.value?.scrollBy(speedX, speedY)
  },
  5,
  { immediate: false },
)

// D'n'D
let clonedElement: HTMLElement | null = null

// Distance from the pointer to the row's top, kept while dragging
let pointerOffsetY = 0

const draggableElement = computed(
  () => unrefElement(draggableEl as any) as unknown as HTMLElement,
)

function getPoint(event: MouseEvent | TouchEvent) {
  return 'touches' in event ? event.touches[0]! : event
}

/**
 * Starts dragging when the move handle was grabbed; returns whether it did
 */
function startDrag(event: MouseEvent | TouchEvent) {
  const target = event.target as HTMLElement
  const isMoveHandle
    = target.classList.contains('query-builder-move-handler')
      || target.classList.contains('query-builder-move-handler__icon')

  if (!isMoveHandle) {
    return false
  }

  event.preventDefault()
  event.stopPropagation()

  pointerOffsetY = draggableElement.value!.getBoundingClientRect().top - getPoint(event).clientY
  cloneElement(event)

  return true
}

function moveDrag(event: MouseEvent | TouchEvent) {
  const { clientX, clientY } = getPoint(event)

  if (clonedElement) {
    // Reordering only depends on the hovered row, so the ghost keeps its column
    // and follows the pointer vertically (a wide row has no room to move sideways)
    const maxTop = window.innerHeight - clonedElement.offsetHeight
    clonedElement.style.top = `${Math.max(0, Math.min(clientY + pointerOffsetY, maxTop))}px`

    draggedItem.value!.pos = { x: clientX, y: clientY }
  }

  calculateScroll(event)
}

// Mouse
function handleMouseDown(event: MouseEvent) {
  if (startDrag(event)) {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleDragEnd)
  }
}

function handleMouseMove(event: MouseEvent) {
  moveDrag(event)
}

// Touch
function handleTouchStart(event: TouchEvent) {
  if (startDrag(event)) {
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleDragEnd)
  }
}

function handleTouchMove(event: TouchEvent) {
  event.preventDefault()
  moveDrag(event)
}

// Shared
function handleDragEnd() {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleDragEnd)

  if (clonedElement) {
    clonedElement.remove()
    clonedElement = null
  }

  // Handle the drag result
  if (draggedItem.value) {
    const { newPath, dropDirection, newPathIsGroup } = draggedItem.value

    if (newPath && dropDirection) {
      // Get current row info
      const currentPath = props.item.path
      const currentParentPath = currentPath.split('.').slice(0, -2).join('.')
      const currentParent = props.parent ?? get(toValue(items), currentParentPath)
      const currentIndex = +currentPath.slice(-1)

      // Get the new location info
      const parentPath = newPathIsGroup
        ? newPath
        : newPath.split('.').slice(0, -2).join('.')
      const parent = get(toValue(items), parentPath) as IQueryBuilderGroup
      const index = newPathIsGroup
        ? dropDirection === 'below'
          ? parent.children.length
          : 0
        : +newPath.slice(-1)

      // In case we're moving the item within its parent
      if (parent === currentParent) {
        if (dropDirection === 'below') {
          parent.children.splice(index + 1, 0, {
            ...props.item,
            path: '_moved',
          })
        } else {
          parent.children.splice(index, 0, { ...props.item, path: '_moved' })
        }

        // We remove the original row
        const idx = parent.children.findIndex(
          child => child.path === currentPath,
        )
        parent.children.splice(idx, 1)
      }

      // In case we're moving the item to another parent
      else {
        const itemExtracted = currentParent.children.splice(currentIndex, 1)[0]

        if (dropDirection === 'below') {
          parent.children.splice(index + 1, 0, itemExtracted)
        } else {
          parent.children.splice(index, 0, itemExtracted)
        }
      }

      // We update the paths for the structure
      updatePaths()

      // We reset the dragged item
      draggedItem.value = undefined
    }
  }

  // Reset scrolling
  scrollBy.value = { speedX: 0, speedY: 0 }
  pause()
}

/**
 * Clones an element and positions it on the mouse cursor
 */
function cloneElement(event: MouseEvent | TouchEvent) {
  const source = draggableElement.value
  clonedElement = source?.cloneNode(true) as HTMLElement

  if (!clonedElement) {
    return
  }

  const { clientX, clientY } = getPoint(event)
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
 * Handles scrolling when dragging an item
 */
function calculateScroll(event: MouseEvent | TouchEvent) {
  if (!queryBuilderEl.value || !clonedElement) {
    return
  }

  const containerRect = queryBuilderEl.value.getBoundingClientRect()
  const threshold = 40 // Distance from edge of container in px
  let speedX = 0
  let speedY = 0

  const { clientX, clientY } = getPoint(event)

  if (clientX < containerRect.left + threshold) {
    // Scroll left
    speedX = -Math.max(1, (threshold - (clientX - containerRect.left)) / 10)
  } else if (clientX > containerRect.right - threshold) {
    // Scroll right
    speedX = Math.max(1, (threshold - (containerRect.right - clientX)) / 10)
  }

  if (clientY < containerRect.top + threshold) {
    // Scroll up
    speedY = -Math.max(1, (threshold - (clientY - containerRect.top)) / 10)
  } else if (clientY > containerRect.bottom - threshold) {
    // Scroll down
    speedY = Math.max(1, (threshold - (containerRect.bottom - clientY)) / 10)
  }

  scrollBy.value = { speedX, speedY }
  if (speedX === 0 && speedY === 0) {
    pause()
  } else if (!isActive.value) {
    resume()
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
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
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
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
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
