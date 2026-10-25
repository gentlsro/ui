<script setup lang="ts">
import type { CSSProperties } from 'vue'

// Types
import type { ITextInputProps } from '../TextInput/types/text-input-props.type'

type IProps = {
  modelValue?: string | null
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

// Layout
const model = defineModel<IProps['modelValue']>('modelValue')
const search = defineModel<string>('search')
const icons = ref<string[]>([])
const isLoading = ref(false)
const hasError = ref(false)

// Data fetching: the layer's own catalog (`modules/icon-catalog`), so every result renders;
// `set:` typed first narrows to that set
let requestId = 0

async function fetchAndSetIcons() {
  const id = ++requestId

  if (!search.value || search.value.length < props.minSearchLength) {
    icons.value = []
    hasError.value = false

    return
  }

  isLoading.value = true

  try {
    const res = await $fetch<{ icons: string[] }>('/_ui/icons/search', {
      query: { q: search.value },
    })

    // A slower earlier response must not replace the latest one
    if (id === requestId) {
      icons.value = res.icons
      hasError.value = false
    }
  } catch {
    if (id === requestId) {
      icons.value = []
      hasError.value = true
    }
  } finally {
    if (id === requestId) {
      isLoading.value = false
    }
  }
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

      <!-- Search failed -->
      <div
        v-else-if="hasError"
        class="p-x-3 p-y-2 color-negative font-rem-14"
      >
        {{ $t('general.errorOccured') }}
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
}

.icon-picker__search {
  @apply p-t-1 p-x-1;
}

.icon-picker__content {
  @apply grid gap-1 rounded-custom p-1 grow overflow-auto max-h-70;

  grid-template-columns: repeat(auto-fill, minmax(28px, 1fr));
}

.icon-picker__content-item {
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
</style>
