<template>
  <div
    class="list-move-handle"
    @click.stop.prevent
  >
    <div class="i-akar-icons:drag-vertical list-move-handle" />
  </div>
</template>

<style scoped lang="scss">
.list-move-handle {
  @apply flex flex-center shrink-0 touch-none cursor-grab self-start;

  &__icon {
    @apply color-ca w-4 h-4 cursor-move;
  }
}

.list-row-item.is-dragging .list-move-handle {
  @apply cursor-grabbing;
}
</style>
