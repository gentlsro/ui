<script setup lang="ts">
// Store
import { usePivotStore } from './stores/pivot.store'

type IProps = {
  groupId: string
  axis?: 'row' | 'column'
}

const props = withDefaults(defineProps<IProps>(), {
  axis: 'row',
})

const { state, toggleGroupCollapse, toggleColumnGroupCollapse } = usePivotStore()

const isCollapsed = computed(() => {
  if (props.axis === 'column') {
    return state.value.collapsedColumnGroupIds.has(props.groupId)
  }

  return state.value.collapsedGroupIds.has(props.groupId)
})

function handleToggleCollapse() {
  if (props.axis === 'column') {
    toggleColumnGroupCollapse(props.groupId)

    return
  }

  toggleGroupCollapse(props.groupId)
}
</script>

<template>
  <Btn
    icon="i-flowbite:chevron-right-outline !h-4.5 !w-4.5"
    class="pivot-collapse-btn shrink-0 p-0.5!"
    :class="{ 'rotate-90': !isCollapsed }"
    size="auto"
    :ripple="false"
    @mousedown.stop.prevent
    @click.stop.prevent="handleToggleCollapse"
  />
</template>
