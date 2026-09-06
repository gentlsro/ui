<script setup lang="ts">
import type { DialogEntry } from '../../composables/useDialog'

// Dialog and legacy render-function content remain an explicit VDOM boundary.
defineProps<{ dialogs: readonly DialogEntry[] }>()
</script>

<template>
  <Dialog
    v-for="dialog in dialogs"
    :key="dialog.id"
    v-bind="dialog.props"
    v-model="dialog.open"
    manual
    @hide="dialog.finish"
  >
    <template
      v-for="(content, name) in dialog.children"
      :key="name"
      #[name]="slotProps"
    >
      <Component
        :is="content"
        v-bind="slotProps"
      />
    </template>
    <template
      v-if="$slots.default && !dialog.children.default"
      #default="slotProps"
    >
      <slot
        :dialog
        v-bind="slotProps"
      />
    </template>
  </Dialog>
</template>
