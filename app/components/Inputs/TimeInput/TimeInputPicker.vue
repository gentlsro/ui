<script setup lang="ts">
import { MaskedRange } from 'imask'
import type { FactoryOpts } from 'imask'

// Types
import type { ITimeInputPickerProps } from './types/time-input-picker-props.type'

const props = defineProps<ITimeInputPickerProps>()
const emits = defineEmits<{
  (e: 'update:used-touch', val: boolean): void
  (e: 'update:is-am', val: boolean): void
  (e: 'update:update:prevent-next-is-am-change', val: boolean): void
}>()

// Utils
const { lastPointerDownEvent } = storeToRefs(useUIStore())

// Layout
const model = defineModel<any>()

// Options
const minuteOptions = computed(() =>
  [...Array.from({ length: 60 }).keys()].map(val => padStart(String(val), 2, '0')),
)
const hourOptions = computed(() =>
  props.is12h
    ? [...Array.from({ length: 12 }).keys()].map(val => padStart(String(val || 12), 2, '0'))
    : [...Array.from({ length: 24 }).keys()].map(val => padStart(String(val), 2, '0')),
)

// Masks
const maskHours = computed<FactoryOpts>(() => {
  return {
    mask: 'HH',
    lazy: false,
    blocks: {
      HH: {
        mask: MaskedRange,
        autofix: 'pad',
        placeholderChar: 'H',
        from: props.is12h ? 1 : 0,
        to: props.is12h ? 12 : 23,
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
const menuProxyEl = useTemplateRef('menuProxyEl')
const hourEl = useTemplateRef('hourEl')
const minuteEl = useTemplateRef('minuteEl')
const isPickerActive = ref(false)
const isAm = useVModel(props, 'isAm', emits, { eventName: 'update:is-am' })
const preventNextIsAmChange = useVModel(props, 'preventNextIsAmChange', emits, {
  eventName: 'update:prevent-next-is-am-change',
})

const usedTouch = computed(() => {
  return lastPointerDownEvent.value?.pointerType !== 'mouse'
})

const storedTime = computed(() => {
  const candidate = typeof model.value === 'string' ? model.value : props.modelValueLocalized

  return /^\d{2}:\d{2}$/.test(candidate ?? '')
    ? candidate!
    : (props.modelValueLocalized || '12:00')
})

function toPickerHour(hh: string) {
  const hour = Number(hh)

  if (!props.is12h || Number.isNaN(hour)) {
    return padStart(hh, 2, '0')
  }

  if (hour === 0 || hour === 12) {
    return '12'
  }

  return padStart(String(hour > 12 ? hour - 12 : hour), 2, '0')
}

const localizedTimeParts = computed(() => {
  const [hh = '12', mm = '00'] = storedTime.value.split(':')

  return {
    hh: toPickerHour(hh),
    mm: padStart(mm, 2, '0'),
  }
})

function handlePickerHide() {
  isPickerActive.value = false
}

function setValue(val: string | undefined | null, type: 'h' | 'm' | 'both') {
  if (typeof val !== 'string') {
    return
  }

  if (type === 'both') {
    const [hh = '12', mm = '00'] = val.split(':')

    preventNextIsAmChange.value = true
    isAm.value = +hh < 12
    model.value = `${toPickerHour(hh)}:${padStart(mm, 2, '0')}`

    return
  }

  if (!/^\d{1,2}$/.test(val)) {
    return
  }

  const padded = padStart(val, 2, '0')
  const { hh, mm } = localizedTimeParts.value

  model.value = type === 'h'
    ? `${padded}:${mm}`
    : `${hh}:${padded}`
}

function setPeriod(nextIsAm: boolean) {
  const { hh, mm } = localizedTimeParts.value

  isAm.value = nextIsAm
  model.value = `${hh}:${mm}`
}

function syncInternalValueWithPicker() {
  nextTick(() => {
    hourEl.value?.sync()
    minuteEl.value?.sync()
  })
}

watch(storedTime, () => {
  syncInternalValueWithPicker()
})

watch(isPickerActive, isActive => {
  if (isActive) {
    syncInternalValueWithPicker()
  }
})

defineExpose({
  show: () => menuProxyEl.value?.show(),
  hide: () => menuProxyEl.value?.hide(),
  sync: () => syncInternalValueWithPicker(),
  getMenuEl: () => menuProxyEl.value,
})
</script>

<template>
  <MenuProxy
    ref="menuProxyEl"
    v-model="isPickerActive"
    manual
    min-w="!60"
    max-w="!80"
    w="80"
    h="!auto"
    position="top"
    placement="bottom-start"
    :reference-target
    no-uplift
    @hide="handlePickerHide"
  >
    <!-- Header -->
    <template
      v-if="usedTouch"
      #header
    >
      <div
        flex="~ gap-x-2 wrap"
        p="l-1 r-1 y-2"
        items-center
      >
        <TextInput
          layout="regular"
          :model-value="localizedTimeParts.hh"
          class="w-[calc(50%-8px)]"
          :mask="maskHours"
          :label="$t('general.hour', 1)"
          inputmode="decimal"
          :ui="{ inputClass: () => 'text-center w-full' }"
          @update:model-value="setValue($event, 'h')"
        />
        <TextInput
          layout="regular"
          :model-value="localizedTimeParts.mm"
          class="w-[calc(50%-8px)]"
          :mask="maskMinutes"
          :label="$t('general.minute', 1)"
          inputmode="decimal"
          :ui="{ inputClass: () => 'text-center w-full' }"
          @update:model-value="setValue($event, 'm')"
        />
      </div>
    </template>

    <!-- Scrollers -->
    <div
      flex="~ gap-x-2 center"
      @mousedown.stop.prevent
    >
      <VerticalScrollPicker
        ref="hourEl"
        :model-value="localizedTimeParts.hh"
        flex="1"
        :items="hourOptions"
        @update:model-value="setValue($event, 'h')"
      />
      <VerticalScrollPicker
        ref="minuteEl"
        :model-value="localizedTimeParts.mm"
        flex="1"
        :items="minuteOptions"
        @update:model-value="setValue($event, 'm')"
      />

      <!-- AM/PM -->
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

    <!-- Shortcuts -->
    <slot name="shortcuts">
      <Field
        v-if="shortcuts"
        :label="$t('general.shortcuts')"
        has-content
        dense
        p="t-4"
      >
        <HorizontalScroller
          class="shortcuts"
          :ui="{ contentClass: ({ defaults }) => `${defaults.base} gap-x-1 p-x-2` }"
          arrows="outside"
        >
          <Chip
            v-for="(shortcut, idx) in shortcuts"
            :key="idx"
            :label="shortcut.label"
            ripple
            center
            class="shortcuts-chip"
            :class="{ 'is-12h': is12h }"
            @click="setValue(shortcut.value, 'both')"
          />
        </HorizontalScroller>
      </Field>
    </slot>
  </MenuProxy>
</template>

<style lang="scss" scoped>
.shortcuts {
  @apply h-9;

  &-chip {
    @apply color-ca text-center cursor-pointer min-w-14;

    &.is-12h {
      @apply min-w-22;
    }
  }
}

.menu[placement^='top'] {
  .shortcuts {
    @apply order--1 p-b-1;
  }
}
</style>
