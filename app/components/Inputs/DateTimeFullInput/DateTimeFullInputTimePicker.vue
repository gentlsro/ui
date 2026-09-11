<script setup lang="ts">
import { MaskedRange } from 'imask'
import type { FactoryOpts } from 'imask'

// Functions
import { getTimePeriod, parseTimeParts, toDisplayHour, toStoredHour } from '../functions/time-format'

const props = withDefaults(defineProps<{
  is12h?: boolean
  modelValue?: string
}>(), {
  is12h: false,
})

const emits = defineEmits<{
  (e: 'update:modelValue', val?: string): void
  (e: 'clear'): void
  (e: 'now'): void
}>()

// Utils
const { lastPointerDownEvent } = storeToRefs(useUIStore())

// Layout
const is12h = toRef(props, 'is12h')

const usedTouch = computed(() => {
  return lastPointerDownEvent.value?.pointerType !== 'mouse'
})

// Options
const hourOptions = computed(() => {
  return is12h.value
    ? [...Array.from({ length: 12 }).keys()].map(val => padStart(String(val || 12), 2, '0'))
    : [...Array.from({ length: 24 }).keys()].map(val => padStart(String(val), 2, '0'))
})

const minuteOptions = computed(() => {
  return [...Array.from({ length: 60 }).keys()].map(val => padStart(String(val), 2, '0'))
})

// Masks – only used by the touch friendly inputs
const maskHours = computed<FactoryOpts>(() => {
  return {
    mask: 'HH',
    lazy: false,
    blocks: {
      HH: {
        mask: MaskedRange,
        autofix: 'pad',
        placeholderChar: 'H',
        from: is12h.value ? 1 : 0,
        to: is12h.value ? 12 : 23,
        maxLength: 2,
      },
    },
  }
})

const maskMinutes = computed<FactoryOpts>(() => {
  return {
    mask: 'mm',
    lazy: false,
    blocks: {
      mm: {
        mask: MaskedRange,
        autofix: 'pad',
        placeholderChar: 'm',
        from: 0,
        to: 59,
        maxLength: 2,
      },
    },
  }
})

// Layout
const hourEl = useTemplateRef('hourEl')
const minuteEl = useTemplateRef('minuteEl')

const storedParts = computed(() => parseTimeParts(props.modelValue) ?? { hh: '00', mm: '00' })

const displayParts = computed(() => {
  return {
    hh: toDisplayHour(storedParts.value.hh, is12h.value),
    mm: storedParts.value.mm,
  }
})

const isAm = computed(() => getTimePeriod(storedParts.value.hh) === 'AM')

function setValue(val: string | null | undefined, type: 'h' | 'm') {
  if (typeof val !== 'string' || !/^\d{1,2}$/.test(val)) {
    return
  }

  const padded = padStart(val, 2, '0')
  const { hh, mm } = storedParts.value

  emits(
    'update:modelValue',
    type === 'h'
      ? `${toStoredHour(padded, is12h.value, isAm.value)}:${mm}`
      : `${hh}:${padded}`,
  )
}

function setPeriod(nextIsAm: boolean) {
  const { hh, mm } = displayParts.value

  emits('update:modelValue', `${toStoredHour(hh, is12h.value, nextIsAm)}:${mm}`)
}

function sync() {
  nextTick(() => {
    hourEl.value?.sync()
    minuteEl.value?.sync()
  })
}

defineExpose({ sync })
</script>

<template>
  <div class="time-picker">
    <!-- Typing is faster than scrolling when there is no precise pointer -->
    <div
      v-if="usedTouch"
      flex="~ gap-x-2 wrap"
      p="x-1 t-1"
    >
      <TextInput
        layout="regular"
        :model-value="displayParts.hh"
        class="w-[calc(50%-8px)]"
        :mask="maskHours"
        :label="$t('general.hour', 1)"
        inputmode="decimal"
        :ui="{ inputClass: () => 'text-center w-full' }"
        @update:model-value="setValue($event, 'h')"
      />
      <TextInput
        layout="regular"
        :model-value="displayParts.mm"
        class="w-[calc(50%-8px)]"
        :mask="maskMinutes"
        :label="$t('general.minute', 1)"
        inputmode="decimal"
        :ui="{ inputClass: () => 'text-center w-full' }"
        @update:model-value="setValue($event, 'm')"
      />
    </div>

    <div
      flex="~ gap-x-2 center"
      @mousedown.stop.prevent
    >
      <VerticalScrollPicker
        ref="hourEl"
        :model-value="displayParts.hh"
        flex="1"
        :items="hourOptions"
        @update:model-value="setValue($event, 'h')"
      />
      <VerticalScrollPicker
        ref="minuteEl"
        :model-value="displayParts.mm"
        flex="1"
        :items="minuteOptions"
        @update:model-value="setValue($event, 'm')"
      />

      <!-- AM / PM -->
      <div
        v-if="is12h"
        flex="~ col"
        w="12"
        p="t-8"
      >
        <Btn
          size="sm"
          :ripple="false"
          @click="setPeriod(true)"
        >
          <template #label>
            <div
              transition="transform duration-200"
              font="mono"
              :class="[
                !isAm ? 'font-thin' : 'font-bold',
                { 'scale-65': !isAm },
              ]"
            >
              {{ $t('general.am') }}
            </div>
          </template>
        </Btn>

        <Btn
          size="sm"
          :ripple="false"
          @click="setPeriod(false)"
        >
          <template #label>
            <div
              transition="transform duration-200"
              font="mono"
              :class="[isAm ? 'font-thin scale-65' : 'font-bold']"
            >
              {{ $t('general.pm') }}
            </div>
          </template>
        </Btn>
      </div>
    </div>

    <!-- Actions -->
    <div
      flex="~ gap-x-1 center"
      p="x-1 t-2"
    >
      <Btn
        icon="i-mdi:clock-outline"
        :label="$t('general.now')"
        size="sm"
        no-uppercase
        @click="emits('now')"
      />

      <Btn
        icon="i-mdi:eraser"
        :label="$t('general.remove')"
        size="sm"
        color="ca"
        no-uppercase
        @click="emits('clear')"
      />
    </div>
  </div>
</template>
