<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeNode } from '../Tree/types/tree-node.type'

// Functions
import { handleItemBlur } from './functions/handle-item-blur'

// Store
import { useTreeDmsStore } from './stores/tree-dms.store'
import { useTreeStore } from '../Tree/stores/tree.store'

type IProps = {
  node: ITreeNode<T>
}

const props = defineProps<IProps>()

// Store
const treeStore = useTreeStore()
const treeDmsStore = useTreeDmsStore()
const { labelKey, nodeMetaById, removeNode } = treeStore
const { nodeEditing, isLoadingByNodeId } = treeDmsStore

// Layout
const inputEl = useTemplateRef('inputEl')
const triggerKey = ref(0)

const node = defineModel<ITreeNode<T>>('node', { required: true })

const isCollapsed = computed(() => {
  return !!nodeMetaById.value[node.value.id]?.isCollapsed
})

function handleBlur() {
  handleItemBlur({
    inputEl: inputEl.value,
    node,
    select,
    getTreeStore: () => treeStore,
    getTreeDmsStore: () => treeDmsStore,
  })
}

function handleKeyPress(ev: KeyboardEvent) {
  if (ev.key === 'Enter') {
    ev.preventDefault()
    ev.stopPropagation()

    inputEl.value?.blur()
  } else if (ev.key === 'Escape') {
    ev.preventDefault()
    ev.stopPropagation()

    triggerKey.value++

    if (node.value.ref.__isNew) {
      removeNode(node.value)
    }

    nodeEditing.value = undefined
  }
}

function handleCancel() {
  removeNode(node.value)
  nodeEditing.value = undefined
}

// Focus & blur handling
whenever(
  () => nodeEditing.value?.id === props.node.id,
  () => {
    nextTick(select)
  },
)

function focus() {
  if (!inputEl.value) {
    return
  }

  inputEl.value?.focus()
}

function select() {
  nextTick(() => {
    const range = document.createRange()
    range.selectNodeContents(inputEl.value!)

    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  })
}

defineExpose({ focus, select })
</script>

<template>
  <div
    class="folder"
    :title="node.ref.name"
  >
    <LoaderBlock
      v-if="isLoadingByNodeId[node.id]"
      size="h-5 w-5"
    />
    <div
      v-else
      class="shrink-0"
      :class="{ 'i-hugeicons:folder-01': isCollapsed, 'i-hugeicons:folder-02': !isCollapsed }"
    />

    <span
      :key="triggerKey"
      ref="inputEl"
      class="folder__name"
      :contenteditable="nodeEditing?.id === node.id"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      tabindex="0"
      @blur="handleBlur"
      @keydown="handleKeyPress"
    >
      {{ get(node.ref, labelKey) }}
    </span>

    <!-- Cancel create -->
    <Btn
      v-if="node.ref.__isNew"
      size="xs"
      m="l-auto r-1"
      color="negative"
      :label="$t('general.cancel')"
      @mousedown.stop.prevent="handleCancel"
    />

    <slot
      name="append"
      :is-new="node.ref.__isNew"
    />
  </div>
</template>

<style lang="scss" scoped>
.folder {
  @apply flex items-center gap-2;

  &__name {
    @apply truncate relative font-rem-14 outline-none rounded-custom p-x-1;
  }
}
</style>
