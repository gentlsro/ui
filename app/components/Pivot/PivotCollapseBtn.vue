<script setup lang="ts">
// Store
import { usePivotStore } from './stores/pivot.store'

type IProps = {
  groupId: string
}

const props = defineProps<IProps>()

const { state, toggleGroupCollapse } = usePivotStore()

const isCollapsed = computed(() => {
  return state.value.collapsedGroupIds.has(props.groupId)
})

function handleToggleCollapse() {
  toggleGroupCollapse(props.groupId)
}
</script>

<template>
  <Btn
    icon="i-flowbite:chevron-right-outline !h-4 !w-4"
    class="pivot-collapse-btn shrink-0"
    :class="{ 'rotate-90': !isCollapsed }"
    size="auto"
    @mousedown.stop.prevent
    @click.stop.prevent="handleToggleCollapse"
  />
</template>
