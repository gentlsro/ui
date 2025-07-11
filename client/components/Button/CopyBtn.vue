<script setup lang="ts">
// Types
import type { IBtnProps } from './types/btn-props.type'

const props = withDefaults(defineProps<IBtnProps & {
  modelValue?: any
  position?: 'left' | 'right' | 'top' | 'bottom'
  transform?: (model: any) => string
  noText?: boolean
}>(), {
  icon: 'i-bx:copy',
})

// COPY
const { copy, copied, isSupported } = useClipboard({ copiedDuring: 2000 })

const copyBtnSize = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'xs'
    case 'sm':
      return 'xs'
    case 'md':
      return 'sm'
    case 'lg':
      return 'md'
    case 'auto':
    default:
      return 'auto'
  }
})

function handleCopy() {
  console.log('Log ~ handleCopy ~ props.transform:')

  if (props.transform) {
    copy(props.transform(props.modelValue))

    return
  }

  copy(String(props.modelValue))
}
</script>

<template>
  <Btn
    v-if="isSupported"
    :size="copyBtnSize"
    :tooltip
    :label
    :ui
    :no-uppercase
    bg="white dark:darker"
    no-dim
    :ripple="false"
    no-hover-effect
    outline="1px"
    :class="[
      copied
        ? '!outline-positive !outline-solid'
        : '!outline-dotted !outline-ca',
    ]"
    @click.stop.prevent="handleCopy"
  >
    <template #icon>
      <div
        v-if="!copied"
        :class="icon"
        class="icon"
      />
      <Checkmark
        v-else
        class="icon"
      />
    </template>

    <BtnConfirmation
      v-if="!noText"
      :model-value="copied"
      :position
      :label="$t('general.copied')"
    />
  </Btn>
</template>

<style lang="scss" scoped>
.btn {
  .icon {
    @apply w-4 h-4 color-ca;
  }

  &--xs {
    .icon {
      @apply w-3 h-3 m-x-2px;
    }
  }

  &--sm {
    .icon {
      @apply w-3.5 h-3.5 m-x-2px;
    }
  }

  &--md {
    .icon {
      @apply w-4.5 h-4.5 m-x-2px;
    }
  }
}
</style>
