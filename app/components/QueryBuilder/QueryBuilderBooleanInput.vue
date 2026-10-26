<script setup lang="ts" vapor>
type IProps = {
  modelValue?: boolean | string
  noDelete?: boolean
  readonly?: boolean
}

defineProps<IProps>()
defineEmits<{
  (e: 'remove:item'): void
}>()

// Layout
const model = defineModel<boolean | string>()
const isPositive = computed(() => model.value === true || model.value === 'true')
const isNegative = computed(() => model.value === false || model.value === 'false')

const positiveBtnClass = computed(() => {
  return isPositive.value
    ? ['!bg-positive', '!border-green-800', '!color-slate-900']
    : ['color-green-700 dark:color-green-400', 'border-positive']
})

const negativeBtnClass = computed(() => {
  return isNegative.value
    ? ['!bg-negative', '!border-red-800', '!color-slate-900']
    : ['color-red-700 dark:color-red-400', 'border-negative']
})
</script>

<template>
  <div class="qb-boolean-input">
    <Btn
      size="sm"
      no-uppercase
      no-dim
      grow
      border="l-4"
      :class="positiveBtnClass"
      :label="$t('general.yes')"
      :disabled="!!readonly"
      :aria-pressed="isPositive"
      @click="model = true"
    />
    <Btn
      size="sm"
      no-uppercase
      no-dim
      grow
      border="r-4"
      :class="negativeBtnClass"
      :label="$t('general.no')"
      :disabled="!!readonly"
      :aria-pressed="isNegative"
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
