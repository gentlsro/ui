<script setup lang="ts" vapor>
import { defineComponent, h } from 'vue'
import type { Component, PropType } from 'vue'
import type { DialogEntry } from '../../composables/useDialog'

// Dialog and legacy render-function content remain an explicit VDOM boundary.
defineProps<{ dialogs: readonly DialogEntry[] }>()

type DialogExpose = {
  hide: (force?: boolean) => void
}

const dialogRefs = new Map<number, DialogExpose>()

const DialogSlotRenderer = defineComponent({
  props: {
    content: { type: [Object, Function] as PropType<Component>, required: true },
    hide: { type: Function as PropType<() => void>, required: true },
  },
  setup: props => () => h(props.content, { hide: props.hide }),
})

function setDialogRef(id: number, target: unknown) {
  if (target) {
    dialogRefs.set(id, target as DialogExpose)
  } else {
    dialogRefs.delete(id)
  }
}

function hideDialog(id: number) {
  dialogRefs.get(id)?.hide()
}

onBeforeUnmount(() => dialogRefs.clear())
</script>

<template>
  <Dialog
    v-for="dialog in dialogs"
    :key="dialog.id"
    :ref="target => setDialogRef(dialog.id, target)"
    v-bind="dialog.props"
    v-model="dialog.open"
    manual
    @hide="dialog.finish"
  >
    <template
      v-for="(renderer, name) in dialog.children"
      :key="name"
      #[name]
    >
      <DialogSlotRenderer
        :content="renderer"
        :hide="() => hideDialog(dialog.id)"
      />
    </template>
    <template
      v-if="$slots.default && !dialog.children.default"
      #default="slotProps"
    >
      <slot
        :dialog
        v-bind="slotProps"
        :hide="() => hideDialog(dialog.id)"
      />
    </template>
  </Dialog>
</template>
