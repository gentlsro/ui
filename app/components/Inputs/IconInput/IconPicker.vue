<script setup lang="ts">
import type { CSSProperties } from 'vue'

// Types
import type { ITextInputProps } from '../TextInput/types/text-input-props.type'

type IProps = {
  modelValue?: string
  readonly?: boolean
  search?: string
  noSearch?: boolean
  minSearchLength?: number
  searchInputProps?: ITextInputProps
  ui?: {
    searchClass?: ClassType
    searchStyle?: CSSProperties
    contentClass?: ClassType
    contentStyle?: CSSProperties
  }
}

const props = withDefaults(defineProps<IProps>(), {
  minSearchLength: 1,
})

// Utils
const { isLoading, fn } = useFn({
  source: { type: 'component', name: 'icon' },
})

// Layout
const model = defineModel<string>('modelValue')
const search = defineModel<string>('search')
const icons = ref<string[]>([])

// Data fetching
function getIcons() {
  let searchStr = search.value ?? ''

  if (searchStr.includes(':')) {
    searchStr = searchStr.split(':').slice(1).join(':')
  }

  if (!searchStr) {
    throw new Error('Search string is empty')
  }

  return $fetch('https://api.iconify.design/search', {
    query: { query: encodeURIComponent(searchStr) },
  })
}

async function fetchAndSetIcons() {
  if (!search.value || search.value.length < props.minSearchLength) {
    return
  }

  const res = await fn<any>(getIcons)
  icons.value = res.icons
}

watchThrottled(search, fetchAndSetIcons, {
  immediate: true,
  throttle: 500,
  leading: true,
  trailing: true,
})
</script>

<template>
  <div class="icon-picker">
    <!-- Search -->
    <slot
      v-if="!noSearch"
      name="search"
    >
      <div class="icon-picker__search">
        <SearchInput
          v-model="search"
          autofocus
          :debounce="500"
          :loading="isLoading"
          :placeholder="$t('general.searchIcon')"
          v-bind="searchInputProps"
        />
      </div>
    </slot>

    <slot name="content">
      <ScrollArea
        v-if="icons.length"
        class="icon-picker__content"
        :class="ui?.contentClass"
        :style="ui?.contentStyle"
        immediate
      >
        <div
          v-for="icon in icons"
          :key="icon"
          class="icon-picker__content-item"
          :class="{ 'is-readonly': readonly, 'is-selected': model === icon }"
          @click="model = icon"
        >
          <Icon
            :name="icon"
            :size="28"
          />
        </div>
      </ScrollArea>

      <!-- Search not long -->
      <div
        v-else-if="!search || search.length < minSearchLength"
        class="p-x-3 p-y-2 color-ca font-rem-14"
      >
        {{ $t('general.atLeastCharactersToSearch', { count: minSearchLength }) }}
      </div>

      <!-- No data -->
      <div
        v-else
        class="p-x-3 p-y-2 color-ca font-rem-14"
      >
        {{ $t('general.noResults') }}
      </div>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.icon-picker {
  @apply flex flex-col bg-white dark:bg-dark-950 rounded-custom overflow-auto;

  &__search {
    @apply p-t-1 p-x-1;
  }

  &__content {
    @apply grid gap-1 rounded-custom p-1 grow overflow-auto max-h-70;

    grid-template-columns: repeat(auto-fill, minmax(28px, 1fr));

    &-item {
      @apply flex flex-center cursor-pointer h-8 rounded-custom;

      &.is-readonly {
        @apply cursor-default;
      }

      > svg {
        @apply p-1;
      }

      &:hover > svg {
        @apply outline outline-ca outline-1 outline-dashed;
      }

      &.is-selected > svg {
        @apply outline outline-primary! outline-1 outline-solid;
      }
    }
  }
}
</style>
