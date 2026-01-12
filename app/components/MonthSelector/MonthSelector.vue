<script setup lang="ts">
// Types
import type { IMonthSelectorProps } from './types/month-selector-props.type'

// Constants
import { MONTH_SELECTOR_DEFAULT_PROPS } from './constants/month-selector-default-props.constant'
import { $bp } from '../../../shared/constants/breakpoints'

type Month = {
  idx: number
  idxString: string
}

const props = withDefaults(defineProps<IMonthSelectorProps>(), {
  ...getComponentProps('monthSelector'),
})

// Utils
const { formatDate } = useDateUtils()
const mergedProps = computed(() => {
  return getComponentMergedProps('monthSelector', props)
})

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

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: MONTH_SELECTOR_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - previous button
const previousBtnClass = computed(() => {
  return mergedProps.value?.ui?.previousBtnClass?.({
    defaults: MONTH_SELECTOR_DEFAULT_PROPS.ui.previousBtnClass(),
  })
})

const previousBtnStyle = computed(() => {
  return mergedProps.value?.ui?.previousBtnStyle?.()
})

// Styles - current button
const currentBtnClass = computed(() => {
  return mergedProps.value?.ui?.currentBtnClass?.({
    defaults: MONTH_SELECTOR_DEFAULT_PROPS.ui.currentBtnClass(),
  })
})

const currentBtnStyle = computed(() => {
  return mergedProps.value?.ui?.currentBtnStyle?.()
})

// Styles - next button
const nextBtnClass = computed(() => {
  return mergedProps.value?.ui?.nextBtnClass?.({
    defaults: MONTH_SELECTOR_DEFAULT_PROPS.ui.nextBtnClass(),
  })
})

const nextBtnStyle = computed(() => {
  return mergedProps.value?.ui?.nextBtnStyle?.()
})

// Styles - grid container
const gridContainerClass = computed(() => {
  return mergedProps.value?.ui?.gridContainerClass?.({
    defaults: MONTH_SELECTOR_DEFAULT_PROPS.ui.gridContainerClass(),
  })
})

const gridContainerStyle = computed(() => {
  return mergedProps.value?.ui?.gridContainerStyle?.()
})

// Styles - month button
const monthBtnClass = computed(() => {
  return mergedProps.value?.ui?.monthBtnClass?.({
    defaults: MONTH_SELECTOR_DEFAULT_PROPS.ui.monthBtnClass(),
  })
})

const monthBtnStyle = computed(() => {
  return mergedProps.value?.ui?.monthBtnStyle?.()
})
</script>

<template>
  <div
    class="month-selector"
    :class="containerClass"
    :style="containerStyle"
  >
    <!-- Previous -->
    <Btn
      size="auto"
      tabindex="-1"
      icon="i-majesticons:chevron-left"
      :class="previousBtnClass"
      :style="previousBtnStyle"
      @click="handleMonthSelect({ idx: month - 1 })"
      @mousedown.stop.prevent=""
    />

    <!-- Current month -->
    <Btn
      ref="monthBtn"
      size="sm"
      no-uppercase
      tabindex="-1"
      :label="formatDate(model, utc ? 'utcMonth' : 'month')"
      :class="currentBtnClass"
      :style="currentBtnStyle"
    />

    <!-- Next -->
    <Btn
      size="auto"
      tabindex="-1"
      icon="i-majesticons:chevron-right"
      :class="nextBtnClass"
      :style="nextBtnStyle"
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
        <div
          :class="gridContainerClass"
          :style="gridContainerStyle"
        >
          <Btn
            v-for="m in months"
            :key="m.idx"
            :label="formatDate(m.date, utc ? 'utcMonth' : 'month')"
            no-uppercase
            tabindex="-1"
            size="sm"
            :class="[
              { 'is-selected': month === m.idx, 'is-current': nowMonth === m.month && month !== m.idx },
              monthBtnClass,
            ]"
            :style="monthBtnStyle"
            @click="handleMonthSelect(m, hide)"
            @mousedown.stop.prevent
          />
        </div>
      </template>
    </Menu>
  </div>
</template>
