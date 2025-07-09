<script setup lang="ts">
// Types
import type { IQueryBuilderItem } from './types/query-builder-item-props.type'

type IProps = {
  modelValue?: boolean | string
  noDelete?: boolean
  readonly?: boolean
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:item', val: any): void
  (e: 'remove:item'): void
}>()

// Layout
const model = defineModel<boolean | string>()

const modelHandler = computed({
  get() {
    if (isNil(model.value)) {
      return null
    }

    return JSON.parse(model.value)
  },
  set(val?: any) {
    model.value = val

    emits('update:item', model.value)
  },
})

const positiveBtnClass = computed(() => {
  return model.value
    ? ['!bg-positive', '!border-green-800', '!color-white']
    : ['color-positive', 'border-positive']
})

const negativeBtnClass = computed(() => {
  return model.value === false
    ? ['!bg-negative', '!border-red-800', '!color-white']
    : ['color-negative', 'border-negative']
})
</script>

<template>
  <div class="qb-boolean-input">
    <Btn
      size="sm"
      no-uppercase
      grow
      border="l-4"
      :class="positiveBtnClass"
      :label="$t('general.yes')"
      :disabled="readonly"
      @click="model = true"
    />
    <Btn
      size="sm"
      no-uppercase
      grow
      border="r-4"
      :class="negativeBtnClass"
      :label="$t('general.no')"
      :disabled="readonly"
      @click="model = false"
    />

    <!-- Remove -->
    <Btn
      v-if="!noDelete"
      size="sm"
      preset="TRASH"
      no-dim
      flex="shrink-0"
      @mousedown.stop
      @click.stop.prevent="$emit('remove:item')"
    />
  </div>
</template>

<style scoped lang="scss">
.qb-boolean-input {
  @apply flex gap-1 p-l-1 p-r-2;
}
</style>
