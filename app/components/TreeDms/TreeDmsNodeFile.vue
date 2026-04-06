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
const { labelKey, removeNode } = treeStore
const { nodeEditing, isLoadingByNodeId, hasNodeIcon } = treeDmsStore

// Layout
const inputEl = useTemplateRef('inputEl')
const triggerKey = ref(0)

const node = defineModel<ITreeNode<T>>('node', { required: true })

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
    inputEl.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

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
    class="file"
    :title="node.ref.name"
  >
    <template v-if="hasNodeIcon.file">
      <LoaderBlock
        v-if="isLoadingByNodeId[node.id]"
        size="h-5 w-5"
      />

      <slot
        v-else
        name="icon"
      >
        <div
          class="i-hugeicons:file-01 shrink-0 w-5 h-5 self-start m-t-px"
        />
      </slot>
    </template>

    <slot
      name="prepend"
      :node
    />

    <span
      :key="triggerKey"
      ref="inputEl"
      class="file__name"
      :contenteditable="nodeEditing?.id === node.id"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      tabindex="0"
      :class="{ 'line-clamp-2': nodeEditing?.id !== node.id }"
      @blur="handleBlur"
      @keydown="handleKeyPress"
    >
      {{ get(node.ref, labelKey) }}
    </span>

    <!-- Cancel create -->
    <Btn
      v-if="node.ref.__isNew"
      size="auto"
      class="cancel-btn"
      :label="$t('general.cancel')"
      :ui="{ labelClass: ({ defaults }) => `${defaults.base} !font-rem-10 p-x-1.5` }"
      @mousedown.stop.prevent="handleCancel"
    />

    <slot
      name="append"
      :is-new="node.ref.__isNew"
    />
  </div>
</template>

<style lang="scss" scoped>
.file {
  @apply flex items-center gap-x-2 gap-y-2px;

  &__name {
    @apply relative font-rem-14 outline-none rounded-custom p-x-1;
  }

  .cancel-btn {
    @apply m-l-auto m-r-1
      color-negative
      bg-white dark:bg-black
      p-x-1.5;
  }
}
</style>
