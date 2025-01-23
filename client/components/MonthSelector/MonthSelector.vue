<script setup lang="ts">
// Types
import type { IMonthSelectorProps } from './types/month-selector-props.type'

// Functions
import { getComponentProps } from '../../functions/get-component-props'

// Constants
import { $bp } from '../../../shared/constants/breakpoints'

type Month = {
  idx: number
  idxString: string
}

withDefaults(defineProps<IMonthSelectorProps>(), {
  ...getComponentProps('monthSelector'),
})

// Utils
const { formatDate } = useDateUtils()

// Layout
const model = defineModel<Datetime>()

const now = useNow({ interval: $duration(15, 'minute').as('ms') })
const nowMonth = computed(() => {
  const dateObj = $date(now.value)

  return `${dateObj.year()}-${dateObj.month()}`
})

const monthBtn = useTemplateRef('monthBtn')
const isMonthSelectorVisible = ref(false)

const month = computed(() => $date(model.value).month())

const months = computed(() => {
  const dateObj = $date(now.value)

  return Array.from({ length: 12 }, (_, idx) => {
    const idxString = padStart(String(idx), 2, '0')
    const date = $date(
      `${dateObj.year()}-${padStart(String(idx + 1), 2, '0')}-01`,
    )

    return {
      idx,
      idxString,
      date: date.valueOf(),
      month: `${date.year()}-${date.month()}`,
    }
  })
})

function handleMonthSelect(month: Pick<Month, 'idx'>, callback?: () => void) {
  model.value = $date(model.value).month(month.idx).valueOf()
  callback?.()
}
</script>

<template>
  <div class="month-selector">
    <!-- Previous -->
    <Btn
      size="auto"
      class="month-selector__previous"
      tabindex="-1"
      icon="i-majesticons:chevron-left"
      @click="handleMonthSelect({ idx: month - 1 })"
      @mousedown.stop.prevent=""
    />

    <!-- Current month -->
    <Btn
      ref="monthBtn"
      size="sm"
      self-center
      no-uppercase
      capitalize
      flex="1"
      h="8"
      tabindex="-1"
      :label="formatDate(model, 'month')"
    />

    <!-- Next -->
    <Btn
      size="auto"
      class="month-selector__next"
      tabindex="-1"
      icon="i-majesticons:chevron-right"
      @click="handleMonthSelect({ idx: month + 1 })"
      @mousedown.stop.prevent
    />

    <!-- Month selector menu -->
    <Menu
      v-model="isMonthSelectorVisible"
      :fit="false"
      no-uplift
      :target="monthBtn"
      :reference-target="$bp.isGreaterOrEqual('xm') ? referenceTarget : undefined"
    >
      <template #default="{ hide }">
        <div grid="~ cols-2 xm:cols-3 gap-1">
          <Btn
            v-for="m in months"
            :key="m.idx"
            :label="formatDate(m.date, 'month')"
            class="month-btn"
            no-uppercase
            tabindex="-1"
            size="sm"
            :class="{
              'is-selected': month === m.idx,
              'is-current': nowMonth === m.month && month !== m.idx,
            }"
            @click="handleMonthSelect(m, hide)"
            @mousedown.stop.prevent
          />
        </div>
      </template>
    </Menu>
  </div>
</template>

<style lang="scss" scoped>
.month-selector {
  @apply flex flex-gap-x-1 items-center;

  &__previous,
  &__next {
    @apply w-8 h-8 p-3;
    @apply '!lt-xs:hidden';
  }
}

.month-btn {
  @apply capitalize;

  &.is-current {
    @apply border-2 border-ca;
  }

  &.is-selected {
    @apply bg-primary color-white;
  }
}
</style>
