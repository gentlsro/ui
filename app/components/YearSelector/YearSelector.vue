<script setup lang="ts">
// Types
import type { IYearSelectorProps } from './types/year-selector-props.type'

// Constants
import { $bp } from '../../../shared/constants/breakpoints'
import { YEAR_SELECTOR_DEFAULT_PROPS } from './constants/year-selector-default-props.constant'

// Components
import type NumberInput from '../Inputs/NumberInput/NumberInput.vue'

const props = withDefaults(defineProps<IYearSelectorProps>(), {
  ...getComponentProps('yearSelector'),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('yearSelector', props)
})

// Layout
const model = defineModel<Datetime>()
const yearInputEl = ref<InstanceType<typeof NumberInput>>()
const isYearSelectorVisible = ref(false)
const isRangeChanged = refAutoReset(false, 300)

/**
 * Internal value is used to navigate through years without changing the actual `model`
 */
const internalValue = ref($date(model.value).year())

const dateObj = computed(() => $date(model.value))

const yearOptions = computed(() => {
  const countOfYearsShown = 5

  return Array.from(Array.from({ length: countOfYearsShown }).keys()).map((_, idx) => {
    return internalValue.value - (Math.floor(countOfYearsShown / 2) - idx)
  })
})

// Increment / Decrement
const modifier = ref<-1 | 1>(1)

// We put a slight delay to the `handleRangeChange` so it doesn't trigger every
// scroll event
const { pause, resume } = useIntervalFn(
  () => handleRangeChange(),
  120,
  { immediate: false, immediateCallback: true },
)

function handleManualYearInputChange(year?: number | null | undefined) {
  if (isRangeChanged.value) {
    return
  }

  if (typeof year === 'number' && String(year).length === 4) {
    handleYearSelect(year)
  }
}

function handleRangeChange() {
  isRangeChanged.value = true
  internalValue.value += modifier.value
}

function startChange(_: PointerEvent, increment = true) {
  modifier.value = increment ? 1 : -1

  window.addEventListener('pointerup', stopChange)
  resume()
}

function stopChange() {
  pause()
  window.removeEventListener('pointerup', stopChange)
}

function sync() {
  return (internalValue.value = $date(props.modelValue).year())
}

function handleYearSelect(year: number) {
  model.value = $date(model.value).year(year).valueOf()
  isYearSelectorVisible.value = false
}

function handleMouseWheel(ev: WheelEvent) {
  isRangeChanged.value = true

  if (ev.deltaY > 0) {
    internalValue.value++
  } else {
    internalValue.value--
  }

  ev.stopPropagation()
  ev.preventDefault()
}

watch(
  model,
  model => (internalValue.value = $date(model).year()),
)

defineExpose({ sync })

const menuEl = useTemplateRef('menuEl')

function addEventListener() {
  useEventListener(menuEl, 'wheel', handleMouseWheel, { passive: false })
}

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: YEAR_SELECTOR_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - previous button
const previousBtnClass = computed(() => {
  return mergedProps.value?.ui?.previousBtnClass?.({
    defaults: YEAR_SELECTOR_DEFAULT_PROPS.ui.previousBtnClass(),
  })
})

const previousBtnStyle = computed(() => {
  return mergedProps.value?.ui?.previousBtnStyle?.()
})

// Styles - next button
const nextBtnClass = computed(() => {
  return mergedProps.value?.ui?.nextBtnClass?.({
    defaults: YEAR_SELECTOR_DEFAULT_PROPS.ui.nextBtnClass(),
  })
})

const nextBtnStyle = computed(() => {
  return mergedProps.value?.ui?.nextBtnStyle?.()
})

// Styles - menu container
const menuContainerClass = computed(() => {
  return mergedProps.value?.ui?.menuContainerClass?.({
    defaults: YEAR_SELECTOR_DEFAULT_PROPS.ui.menuContainerClass(),
  })
})

const menuContainerStyle = computed(() => {
  return mergedProps.value?.ui?.menuContainerStyle?.()
})

// Styles - year button
const yearBtnClass = computed(() => {
  return mergedProps.value?.ui?.yearBtnClass?.({
    defaults: YEAR_SELECTOR_DEFAULT_PROPS.ui.yearBtnClass(),
  })
})

const yearBtnStyle = computed(() => {
  return mergedProps.value?.ui?.yearBtnStyle?.()
})
</script>

<template>
  <div
    class="year-selector"
    :class="containerClass"
    :style="containerStyle"
  >
    <!-- Previous btn -->
    <Btn
      size="auto"
      tabindex="-1"
      icon="i-majesticons:chevron-left"
      :class="previousBtnClass"
      :style="previousBtnStyle"
      @click="handleYearSelect(dateObj.year() - 1)"
    />

    <!-- Year input -->
    <NumberInput
      ref="yearInputEl"
      :model-value="internalValue"
      no-grouping
      :step="null"
      size="sm"
      w="10"
      grow
      no-border
      :ui="{
        inputClass: () => 'text-center !focus:(bg-white dark:bg-dark-950) !p-x-0',
        inputContainerClass: () => 'bg-transparent focus-within:bg-transparent',
      }"
      @update:model-value="handleManualYearInputChange"
    />

    <!-- Next btn -->
    <Btn
      size="auto"
      tabindex="-1"
      icon="i-majesticons:chevron-right"
      :class="nextBtnClass"
      :style="nextBtnStyle"
      @click="handleYearSelect(dateObj.year() + 1)"
    />

    <!-- Year select menu -->
    <Menu
      v-model="isYearSelectorVisible"
      :target="yearInputEl"
      :fit="false"
      w="60"
      :reference-target="$bp.isGreaterOrEqual('xm') ? referenceTarget : undefined"
      no-uplift
      @vue:mounted="addEventListener"
      @before-hide="sync"
    >
      <div
        ref="menuEl"
        :class="menuContainerClass"
        :style="menuContainerStyle"
      >
        <Btn
          tabindex="-1"
          size="xs"
          icon="i-bi:caret-up-fill"
          color="ca"
          name="increment"
          :ripple="false"
          @pointerdown="startChange($event, false)"
          @mousedown.stop.prevent
        />

        <Btn
          v-for="year in yearOptions"
          :key="year"
          size="sm"
          tabindex="-1"
          name="year"
          :class="[
            { 'is-selected': dateObj.year() === year },
            yearBtnClass,
          ]"
          :style="yearBtnStyle"
          @click="handleYearSelect(year)"
          @mousedown.stop.prevent
        >
          {{ year }}
        </Btn>

        <Btn
          tabindex="-1"
          size="xs"
          icon="i-bi:caret-up-fill rotate-180"
          color="ca"
          name="decrement"
          :ripple="false"
          @pointerdown="startChange($event, true)"
          @mousedown.stop.prevent
        />
      </div>
    </Menu>
  </div>
</template>
