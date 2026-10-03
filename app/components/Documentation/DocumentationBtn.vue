<script setup lang="ts">
/**
 * Override point for a host-provided documentation button.
 *
 * Layer components render `<DocumentationBtn path="..." />` next to features that
 * have end-user documentation (e.g. `path="columnSelection"` in the table column
 * selection dialog). The layer itself has no documentation to link to, so this
 * default renders nothing.
 *
 * To show a real button, define a component named `DocumentationBtn` in the host
 * app (e.g. `app/components/DocumentationBtn.vue`). Nuxt gives host components
 * priority over layer components with the same name, so it replaces this one.
 */
defineProps<{
  /**
   * Documentation key/path of the feature the button belongs to
   */
  path?: string
}>()
</script>

<template>
  <slot />
</template>
