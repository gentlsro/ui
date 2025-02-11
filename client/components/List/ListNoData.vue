<script setup lang="ts">
import { getElementSize } from '$utils'

// Store
import { useListStore } from './stores/list.store'

const emits = defineEmits<{
  (e: 'change:contentSize', payload: { height: number, width: number }): void
}>()

// Store
const { isLoading, listItems } = storeToRefs(useListStore())

// Layout
const bannerEl = useTemplateRef('bannerEl') as any
const { height } = useElementSize(bannerEl)

watch(height, () => {
  const el = unrefElement(bannerEl) as HTMLElement

  if (!el) {
    return
  }

  const { total } = getElementSize(el)

  emits('change:contentSize', {
    height: total.height,
    width: total.width,
  })
})
</script>

<template>
  <Banner
    v-if="!isLoading && !listItems?.length"
    ref="bannerEl"
    no-transition
    class="list-content list-content--empty"
  >
    <span text-caption>
      {{ $t('general.noData') }}
    </span>
  </Banner>
</template>

<style scoped lang="scss">
.list-content {
  @apply m-x-2 p-b-2;
}
</style>
