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
  (e: 'clear'): void
  (e: 'now'): void
  (e: 'update:dateValue', val?: string): void
  (e: 'update:timeValue', val?: string): void
}>()

// Constants
const PANES = [
  { name: 'date', label: 'dataType.date' },
  { name: 'time', label: 'dataType.time' },
]

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

const tabsUi: ITabsProps['ui'] = {
  containerClass: ({ defaults }) => `${defaults.base} p-2`,
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
  <Tabs
    v-if="isCompact"
    v-model="activePane"
    :keep-alive-props="{}"
    :ui="tabsUi"
  >
    <Tab
      v-for="pane in PANES"
      :key="pane.name"
      :name="pane.name"
      :label="$t(pane.label)"
    >
      <div class="datetime-full-picker__pane">
        <DatePicker
          v-if="pane.name === 'date'"
          ref="datePickerEl"
          v-bind="datePickerProps"
          @update:model-value="emits('update:dateValue', $event)"
        />

        <DateTimeFullInputTimePicker
          v-else
          v-bind="timePickerProps"
          @clear="emits('clear')"
          @now="emits('now')"
          @update:model-value="emits('update:timeValue', $event)"
        />
      </div>
    </Tab>
  </Tabs>

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
        @update:model-value="emits('update:dateValue', $event)"
      />
    </section>

    <section class="datetime-full-picker__pane is-time">
      <div class="datetime-full-picker__title">
        {{ $t('dataType.time') }}
      </div>

      <DateTimeFullInputTimePicker
        v-bind="timePickerProps"
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

.datetime-full-picker__pane {
  @apply flex flex-col p-2;

  &.is-time {
    @apply border-l border-ca;
  }
}

.datetime-full-picker__title {
  @apply font-bold p-x-2 p-b-1;
}
</style>
