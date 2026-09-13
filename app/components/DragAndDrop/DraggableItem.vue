<script setup lang="ts" vapor generic="T extends IItem">
type IProps = {
  item: T
  tag?: string
}

const props = defineProps<IProps>()

type DraggableElement = HTMLElement & {
  'get-item'?: () => T
}

const itemEl = useTemplateRef<DraggableElement>('itemEl')

// Layout
const componentTag = computed(() => {
  return props.tag || 'div'
})

function getItem() {
  return props.item
}

onMounted(() => {
  if (itemEl.value) {
    itemEl.value['get-item'] = getItem
  }
})
</script>

<template>
  <Component
    :is="componentTag"
    ref="itemEl"
    data-draggable-item
  >
    <slot />
  </Component>
</template>

<style lang="scss" scoped>
.is-dragged[data-draggable-item] {
  @apply relative;

  &::after {
    @apply content-empty absolute inset-0 rounded-custom
      bg-primary;
  }
}
</style>
