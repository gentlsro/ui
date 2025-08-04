<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { CSSProperties } from 'vue'

type IProps = {
  modelValue?: string
  readonly?: boolean
  search?: string
  noSearch?: boolean
  ui?: {
    searchClass?: ClassType
    searchStyle?: CSSProperties
    contentClass?: ClassType
    contentStyle?: CSSProperties
  }
}

defineProps<IProps>()

// Utils
const { isLoading, handleRequest } = useRequest()

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
  if (!search.value || search.value.length < 3) {
    return
  }

  const res = await handleRequest<any>(
    getIcons,
    { notification: { error: false } },
  )

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
        />
      </div>
    </slot>

    <slot name="content">
      <div
        v-if="icons.length"
        class="icon-picker__content"
        :class="ui?.contentClass"
        :style="ui?.contentStyle"
      >
        <div
          v-for="icon in icons"
          :key="icon"
          class="icon-picker__content-item"
          :class="{ 'is-readonly': readonly, 'is-selected': model === icon }"
          @click="model = icon"
        >
          <Icon
            :icon
            height="28"
            width="28"
          />
        </div>
      </div>

      <!-- Search not long -->
      <Banner
        v-else-if="!search || search.length < 3"
        :label="$t('general.atLeastCharactersToSearch', { count: 3 })"
        border="!none"
        m="t-3 b-2"
        icon-center
        no-transition
        :ui="{ iconClass: '!m-t-0 !w-4 !h-4', labelClass: '!p-y-0 font-rem-12' }"
      />

      <!-- No data -->
      <Banner
        v-else
        :label="$t('general.noResults')"
        border="!none"
        m="t-3 b-2"
        icon-center
        no-transition
        :ui="{ iconClass: '!m-t-0 !w-4 !h-4', labelClass: '!p-y-0 font-rem-12' }"
      />
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
      @apply flex flex-center cursor-pointer h-8;

      &.is-readonly {
        @apply cursor-default;
      }

      > svg {
        @apply p-1;
      }

      &:hover > svg {
        @apply outline outline-ca outline-2 outline-dashed rounded-custom;
      }

      &.is-selected > svg {
        @apply outline outline-primary outline-2 outline-dashed rounded-custom;
      }
    }
  }
}
</style>
