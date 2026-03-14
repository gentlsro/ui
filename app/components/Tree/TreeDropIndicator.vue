<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeNode } from './types/tree-node.type'

// Store
import { useTreeStore } from './stores/tree.store'

const { treeEl, dragMeta, nodeMetaById, childrenKey } = useTreeStore<T>()

function getCss(node: Pick<ITreeNode<T>, 'id'>) {
  const path = nodeMetaById.value[node.id]?.path

  if (!path) {
    return
  }

  const childrenPath = `${path}.${childrenKey.value}`

  const treeElDom = unrefElement(treeEl) as HTMLElement
  const els = treeElDom.querySelectorAll(`[data-path="${path}"], [data-path^="${childrenPath}"]`)

  if (!els.length) {
    return
  }

  const firstEl = els[0] as HTMLElement
  const firstElTranslateY = +getComputedStyle(firstEl).getPropertyValue('--translateY')

  const lastEl = els[els.length - 1] as HTMLElement
  const lastElTranslateY = +getComputedStyle(lastEl).getPropertyValue('--translateY')
  const lastElHeight = +getComputedStyle(lastEl).getPropertyValue('--rowHeight')

  return {
    '--translateY': firstElTranslateY,
    '--height': (lastElTranslateY + lastElHeight) - firstElTranslateY,
    '--left': firstEl.offsetLeft,
  }
}

const isDropIndicator = computed(() => {
  return dragMeta.value?.targetEl
    && dragMeta.value?.dropAllowed
})

const parentDropIndicatorCss = computed(() => {
  if (!dragMeta.value?.dropAllowed || !dragMeta.value?.targetParent) {
    return
  }

  const parentCss = getCss(dragMeta.value?.targetParent)

  if (parentCss) {
    return parentCss
  }

  const treeElDom = unrefElement(treeEl) as HTMLElement
  const visibleNodeEls = treeElDom.querySelectorAll('.content-row') as NodeListOf<HTMLElement>
  const lastVisibleEl = visibleNodeEls[visibleNodeEls.length - 1] as HTMLElement

  const lastVisibleElTranslateY = +getComputedStyle(lastVisibleEl).getPropertyValue('--translateY')
  const lastVisibleElHeight = +getComputedStyle(lastVisibleEl).getPropertyValue('--rowHeight')

  return {
    '--translateY': 0,
    '--height': lastVisibleElTranslateY + lastVisibleElHeight,
    '--left': lastVisibleEl?.offsetLeft ?? 0,
  }
})
</script>

<template>
  <div
    v-if="isDropIndicator"
    class="tree-drop-indicator"
    :style="dragMeta?.dropIndicatorCSS"
  >
    <div
      class="tree-drop-indicator__icon"
      :class="{
        'rotate-y-180 -top-9px': dragMeta.placement === 'below',
        'rotate-180 -top-6px': dragMeta.placement === 'above',
      }"
    >
      <div i-tabler:arrow-back />
    </div>
  </div>

  <div
    v-else-if="parentDropIndicatorCss"
    class="tree-drop-indicator__parent"
    :style="parentDropIndicatorCss"
  />
</template>

<style lang="scss" scoped>
.tree-drop-indicator {
  @apply absolute z-1 right-0 h-2px bg-primary pointer-events-none top-0;

  transform: translateY(calc(var(--translateY) * 1px));
  left: var(--left, 12px);

  &__icon {
    @apply w-4 h-4 relative left--3 rounded-custom
    color-primary bg-white dark:bg-darker;
  }
}

.tree-drop-indicator__parent {
  @apply absolute z-1 pointer-events-none rounded-custom
  bg-primary/32 dark:bg-primary/20;

  top: 0;
  left: calc(var(--left) * 1px);
  right: 0;
  transform: translateY(calc(var(--translateY) * 1px));
  height: calc(var(--height) * 1px);
}
</style>
