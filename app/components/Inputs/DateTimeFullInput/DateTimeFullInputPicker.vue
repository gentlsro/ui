<script setup lang="ts">
// Types
import type { ITabsProps } from '../../Tabs/types/tabs-props.type'
import type { IDateTimeFullInputProps } from './types/date-time-full-input-props.type'

const props = withDefaults(defineProps<{
  allowedDays?: IDateTimeFullInputProps['allowedDays']
  dateValue?: string
  disabledDays?: IDateTimeFullInputProps['disabledDays']
  is12h?: boolean
  isCompact?: boolean
  timeValue?: string
  utc?: boolean
}>(), {
  is12h: false,
  isCompact: false,
})

const emits = defineEmits<{
  (e: 'apply'): void
  (e: 'clear'): void
  (e: 'now'): void
  (e: 'update:dateValue', val?: string): void
  (e: 'update:timeValue', val?: string): void
}>()

// Layout
const activePane = ref('date')
const datePickerEl = useTemplateRef<{ sync: () => void }>('datePickerEl')

const datePickerProps = computed(() => ({
  allowedDays: props.allowedDays,
  disabledDays: props.disabledDays,
  modelValue: props.dateValue,
  utc: props.utc,
}))

const timePickerProps = computed(() => ({
  is12h: props.is12h,
  modelValue: props.timeValue,
}))

// The calendar lives in a cached tab, so it has to catch up when it comes back
watch(activePane, pane => {
  if (pane === 'date') {
    nextTick(() => datePickerEl.value?.sync())
  }
})

// The calendar is the tallest pane – the time pane keeps its height, so the dialog does not resize
const calendarEl = useTemplateRef<HTMLElement>('calendarEl')
const calendarHeight = ref<number>()

useResizeObserver(calendarEl, ([entry]) => {
  // The observer reports a zero height while the calendar is unmounted, which would drop the min-height
  const height = entry?.borderBoxSize?.[0]?.blockSize ?? entry?.contentRect.height

  if (height) {
    calendarHeight.value = height
  }
})

const timePaneStyle = computed(() => {
  return calendarHeight.value ? { minHeight: `${calendarHeight.value}px` } : undefined
})

const tabsUi: ITabsProps['ui'] = {
  containerClass: ({ defaults }) => `${defaults.base} p-x-1 p-t-2 p-b-1`,
  navigationContentClass: ({ defaults }) => `${defaults.base} p-x-1`,
}

defineExpose({
  sync: () => datePickerEl.value?.sync(),
  showPane: (pane: string) => {
    activePane.value = pane
  },
})
</script>

<template>
  <!-- The picker is a dialog on a narrow viewport, so the panes become tabs -->
  <div
    v-if="isCompact"
    class="datetime-full-picker__compact"
  >
    <!-- The dialog is closed explicitly – unlike on a desktop the picking continues in the other pane -->
    <Btn
      class="datetime-full-picker__apply bg-primary color-white"
      :label="$t('general.apply')"
      size="sm"
      no-uppercase
      no-dim
      @click="emits('apply')"
    />

    <Tabs
      v-model="activePane"
      :keep-alive-props="{}"
      :ui="tabsUi"
    >
      <Tab
        name="date"
        icon="i-system-uicons:calendar-date"
        :label="$t('dataType.date')"
      >
        <div
          ref="calendarEl"
          class="datetime-full-picker__pane is-compact"
        >
          <DatePicker
            ref="datePickerEl"
            v-bind="datePickerProps"
            no-controls
            class="rounded-custom"
            @update:model-value="emits('update:dateValue', $event)"
          />
        </div>
      </Tab>

      <Tab
        name="time"
        icon="i-mdi:clock-outline"
        :label="$t('dataType.time')"
      >
        <div
          class="datetime-full-picker__pane is-compact justify-center"
          :style="timePaneStyle"
        >
          <DateTimeFullInputTimePicker
            v-bind="timePickerProps"
            no-controls
            class="w-50 m-x-auto"
            @clear="emits('clear')"
            @now="emits('now')"
            @update:model-value="emits('update:timeValue', $event)"
          />
        </div>
      </Tab>
    </Tabs>

    <!-- The actions are shared by both panes -->
    <div class="datetime-full-picker__footer">
      <Btn
        icon="mdi:eraser"
        :label="$t('general.remove')"
        size="sm"
        color="negative"
        no-uppercase
        @click="emits('clear')"
      />

      <Btn
        icon="mdi:clock-outline"
        :label="$t('general.now')"
        size="sm"
        no-uppercase
        @click="emits('now')"
      />
    </div>
  </div>

  <!-- Desktop: both panes next to each other -->
  <div
    v-else
    class="datetime-full-picker"
  >
    <section class="datetime-full-picker__pane">
      <div class="datetime-full-picker__title">
        {{ $t('dataType.date') }}
      </div>

      <DatePicker
        ref="datePickerEl"
        v-bind="datePickerProps"
        no-controls
        @update:model-value="emits('update:dateValue', $event)"
      >
        <!-- The actions replace the `Today` button of the date picker -->
        <template #controls>
          <div
            flex="~ items-center gap-x-1"
            m="l-auto"
          >
            <Btn
              icon="mdi:eraser"
              :label="$t('general.remove')"
              size="sm"
              color="negative"
              no-uppercase
              @click="emits('clear')"
            />

            <Btn
              icon="mdi:clock-outline"
              :label="$t('general.now')"
              size="sm"
              no-uppercase
              @click="emits('now')"
            />
          </div>
        </template>
      </DatePicker>
    </section>

    <section class="datetime-full-picker__pane is-time">
      <div class="datetime-full-picker__title">
        {{ $t('dataType.time') }}
      </div>

      <DateTimeFullInputTimePicker
        v-bind="timePickerProps"
        no-controls
        dense-wheels
        class="p-2"
        @clear="emits('clear')"
        @now="emits('now')"
        @update:model-value="emits('update:timeValue', $event)"
      />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.datetime-full-picker {
  @apply flex items-stretch;
}

.datetime-full-picker__compact {
  @apply relative;
}

.datetime-full-picker__pane {
  @apply flex flex-col p-t-2;

  &.is-time {
    @apply border-l border-ca w-45;
  }

  // Both tabs keep the width of the calendar, so the dialog does not resize between them
  &.is-compact {
    width: min(90vw, 400px);
    max-width: 100%;
  }
}

.datetime-full-picker__apply {
  @apply absolute right-2 top-2 z-1;
}

.datetime-full-picker__footer {
  @apply flex items-center justify-end gap-x-1 p-x-2 p-y-1 border-t-1 border-slate-100 dark:border-dark-700;
}

.datetime-full-picker__title {
  @apply font-bold p-x-3 p-b-1 p-t-2;
}
</style>
