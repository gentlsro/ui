<script setup lang="ts">
// Store
import { useListStore } from './stores/list.store'

const emits = defineEmits<{
  (e: 'change:contentSize', payload: { height: number, width: number }): void
}>()

// Store
const { isLoading, listItems } = storeToRefs(useListStore())

// Layout
const bannerEl = useTemplateRef('bannerEl')
// @ts-expect-error Too complex to represent
const { height, width } = useElementSize(bannerEl)

watch(height, h => {
  emits('change:contentSize', { height: h, width: width.value })
})
</script>

<template>
  <Banner
    v-if="!isLoading && !listItems?.length"
    ref="bannerEl"
    m="x-2"
    min-w="60"
    no-transition
  >
    <span text-caption>
      {{ $t('general.noData') }}
    </span>
  </Banner>
</template>
