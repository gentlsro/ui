<script setup lang="ts">
import type { CSSProperties } from 'vue'

// Types
import type { IVerticalScrollPickerProps } from './types/vertical-scroll-picker-props.type'

const props = withDefaults(defineProps<IVerticalScrollPickerProps>(), {
  maxVisible: 5,
  itemHeight: 40,
  optionKey: 'id',
  optionLabel: 'label',
})

const emits = defineEmits<{
  (e: 'update:modelValue', val: any): void
}>()

const items = computed(() => props.items ?? [])
const scrollEl = ref<HTMLElement>()
const isJumping = ref(false)

const overscan = computed(() => Math.floor(props.maxVisible / 2))

const containerStyle = computed<CSSProperties>(() => {
  return {
    '--item-height': `${props.itemHeight}px`,
    'height': `${props.maxVisible * props.itemHeight}px`,
  }
})

const spacerStyle = computed<CSSProperties>(() => {
  return { height: `${overscan.value * props.itemHeight}px` }
})

function indexForValue(value: any) {
  return items.value.findIndex(item => item === value)
}

function indexFromScrollTop(scrollTop: number) {
  return Math.round(scrollTop / props.itemHeight)
}

function scrollToIndex(index: number) {
  const el = scrollEl.value

  if (!el || index < 0) {
    return
  }

  isJumping.value = true
  el.scrollTop = index * props.itemHeight
  requestAnimationFrame(() => {
    isJumping.value = false
  })
}

function emitIndex(index: number) {
  const value = items.value[index]

  if (!isNil(value) && value !== props.modelValue) {
    emits('update:modelValue', value)
  }
}

function settle() {
  if (!scrollEl.value || isJumping.value) {
    return
  }

  emitIndex(indexFromScrollTop(scrollEl.value.scrollTop))
}

function handleItemClick(index: number) {
  scrollToIndex(index)
  emitIndex(index)
}

function sync() {
  scrollToIndex(indexForValue(props.modelValue))
}

useScroll(scrollEl, {
  onStop: settle,
  idle: 240,
})

watch(() => props.modelValue, value => {
  if (isJumping.value) {
    return
  }

  const current = items.value[indexFromScrollTop(scrollEl.value?.scrollTop ?? 0)]

  if (current === value) {
    return
  }

  sync()
})

onMounted(() => {
  nextTick(sync)
})

defineExpose({
  sync: () => nextTick(sync),
})
</script>

<template>
  <div
    class="scroll-picker"
    :style="containerStyle"
  >
    <div
      v-if="title"
      class="scroll-picker__title"
    >
      {{ title }}
    </div>

    <div class="scroll-picker__frame">
      <div
        ref="scrollEl"
        class="scroll-picker__scroller hide-scrollbar"
      >
        <div
          class="scroll-picker__spacer"
          :style="spacerStyle"
        />

        <div
          v-for="(item, index) in items"
          :key="index"
          class="scroll-picker__item"
          @click="handleItemClick(index)"
        >
          {{ item }}
        </div>

        <div
          class="scroll-picker__spacer"
          :style="spacerStyle"
        />
      </div>

      <div class="scroll-picker__indicator" />
      <div class="scroll-picker__shade scroll-picker__shade--top" />
      <div class="scroll-picker__shade scroll-picker__shade--bottom" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scroll-picker {
  @apply flex flex-col min-w-0;

  &__title {
    @apply flex items-center justify-center h-8 p-r-2 truncate;
  }

  &__frame {
    @apply relative overflow-hidden rounded-custom border border-ca;
  }

  &__scroller {
    @apply h-full overflow-y-auto select-none;

    scroll-snap-type: y proximity;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  &__item {
    @apply flex items-center justify-center font-mono;

    height: var(--item-height);
    scroll-snap-align: center;
  }

  &__indicator {
    @apply absolute left-0 w-full pointer-events-none border-y-2 border-ca;

    top: 50%;
    height: var(--item-height);
    transform: translateY(-50%);
  }

  &__shade {
    @apply absolute left-0 w-full pointer-events-none bg-white/80 dark:bg-darker/90;

    height: calc(50% - var(--item-height) / 2);

    &--top {
      @apply top-0 rounded-t-2;
    }

    &--bottom {
      @apply bottom-0 rounded-b-2;
    }
  }
}
</style>
