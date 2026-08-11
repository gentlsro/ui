<script setup lang="ts" generic="T extends IItem = IItem">
// Models
import type { PivotItem } from './models/pivot-item.model'

// Functions
import { hasPivotItemActiveFilters } from './functions/pivot-filter-usage'

type IProps = {
  item: PivotItem<T>
  size?: IBtnProps['size']
  showLabel?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  size: 'xs',
  showLabel: false,
})

const isMenuOpen = ref(false)
const filterMenuEl = useTemplateRef('filterMenuEl')

const isFiltered = computed(() => hasPivotItemActiveFilters(props.item))

const btnClass = computed(() => ({
  'is-filtered': isFiltered.value,
}))

function handleBeforeHide() {
  filterMenuEl.value?.pruneEmptyFilters?.()
}
</script>

<template>
  <Btn
    class="pivot-filter-btn"
    :class="btnClass"
    :size
    :icon="showLabel ? undefined : 'i-ic:round-filter-alt w-4.5 h-4.5'"
    :ripple="false"
    no-hover-effect
    :ui="{
      containerClass: ({ defaults }) => showLabel
        ? `flex items-center gap-1 rounded-custom p-y-2px p-l-3 p-r-1`
        : 'rounded-custom p-2px',
    }"
  >
    <template v-if="showLabel">
      <span
        v-if="showLabel"
        class="font-rem-12"
      >
        {{ item._label }}
      </span>

      <div class="i-flowbite:chevron-right-outline rotate-90" />
    </template>

    <MenuProxy
      v-model="isMenuOpen"
      w="90"
      h="!auto"
      max-h="!2/3"
      :ui="{ contentClass: ({ defaults }) => `${defaults.all} gap-2` }"
      :no-arrow="false"
      no-transition
      no-uplift
      dense
      @before-hide="handleBeforeHide"
    >
      <PivotFilterMenu
        ref="filterMenuEl"
        :item
      />
    </MenuProxy>
  </Btn>
</template>

<style scoped lang="scss">
.pivot-filter-btn {
  @apply overflow-hidden shrink-0;

  &.is-filtered {
    @apply bg-white color-primary font-semibold;
  }

  // &.is-filtered::before {
  //   @apply absolute content-empty rotate-45 bg-primary -top-24.5px -left-24.5px
  //     w-1 h-3/2 w-3/2;
  // }
}
</style>
