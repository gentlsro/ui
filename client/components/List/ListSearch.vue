<script setup lang="ts">
// Types
import type { IListProps } from './types/list-props.type'

// Store
import { useListStore } from './stores/list.store'

type IProps = Pick<IListProps, 'searchInputProps' | 'ui' | 'search'>

defineProps<IProps>()

defineSlots<{
  default: (props: { search?: string, isLoading: boolean, items: IItem[] }) => any
  left: () => any
  right: () => any
  below: () => (props: { search?: string, isLoading: boolean, items: IItem[] }) => any
}>()

// Store
const { searchEl, isLoading, items, $zAddItem } = storeToRefs(useListStore())

// Layout
const search = defineModel<string>('search')
</script>

<template>
  <div
    class="list-search__container"
    :class="ui?.searchClass"
    :style="ui?.searchStyle"
  >
    <slot
      :search
      :is-loading
      :items
    >
      <div class="list-search">
        <slot name="left" />

        <SearchInput
          ref="searchEl"
          v-model="search"
          grow
          v-bind="searchInputProps"
          :loading="isLoading"
          autofocus
          :validation="$zAddItem.$errors"
          data-cy="list-search"
        />

        <Btn
          size="sm"
          icon="i-eva:close-fill !w-6 !h-6"
          color="negative"
          m="l-1"
          class="mobile-close-btn"
          @click="$hide"
        />

        <slot name="right" />
      </div>
    </slot>

    <slot
      name="below"
      :search
      :is-loading
      :items
    />
  </div>
</template>

<style lang="scss" scoped>
.list-search {
  @apply flex items-center;

  &__container {
    @apply flex flex-col;
  }
}

.list.is-dense {
  .list-search {
    @apply p-1;
  }
}

// If the ListSearch is inside a `Selector`, and the menu is placed on top of the Selector,
// we put the search input on the bottom
.selector-menu[placement^='top'] .list-search__container {
  @apply order-last;
}

.mobile-close-btn {
  @apply hidden;
}

@media (pointer: coarse) {
  .dialog .list-search {
    :deep(.input-wrapper__regular-append) {
      @apply hidden;
    }

    .mobile-close-btn {
      @apply flex;
    }
  }
}
</style>
