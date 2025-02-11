<script setup lang="ts">
// Store
import { useListStore } from './stores/list.store'

// Store
const { isLoading, listItems } = storeToRefs(useListStore())

// Layout
const bannerEl = useTemplateRef('bannerEl') as any
</script>

<template>
  <Banner
    v-if="!isLoading && !listItems?.length"
    ref="bannerEl"
    m="x-2"
    no-transition
    p="b-2"
  >
    <span text-caption>
      {{ $t('general.noData') }}
    </span>
  </Banner>
</template>
