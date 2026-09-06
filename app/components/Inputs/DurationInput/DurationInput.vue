<script setup lang="ts" vapor>
import { mergeProps } from 'vue'
import { MODIFIER_BY_UNIT } from '#layers/utilities/app/composables/useDuration'
import type { DurationUnit } from '#layers/utilities/app/composables/useDuration'

// Types
import type { IDurationInputProps } from './types/duration-input-props.type'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<IDurationInputProps>(), {
  ...getComponentProps('durationInput'),
})

defineEmits<{
  (e: 'update:modelValue', val?: IDurationInputProps['modelValue']): void
  (e: 'focus'): void
  (e: 'blur'): void
}>()

// Utils
const { getDuration } = useDuration()

const mergedProps = computed(() => {
  return getComponentMergedProps('durationInput', props)
})

// Layout
const numberInputEl = useTemplateRef('numberInputEl')
const menuEl = useTemplateRef('menuEl')
const durationUnit = ref<DurationUnit>(props.initialDurationUnit)
const modelOriginal = defineModel<IDurationInputProps['modelValue']>()

const modelByUnit = computed<Record<DurationUnit, number>>(() => {
  const model = isNumeric(modelOriginal.value) ? modelOriginal.value : 0

  return {
    year: getDuration(model, 'year').val,
    month: getDuration(model, 'month').val,
    week: getDuration(model, 'week').val,
    day: getDuration(model, 'day').val,
    hour: getDuration(model, 'hour').val,
    minute: getDuration(model, 'minute').val,
    second: getDuration(model, 'second').val,
    millisecond: getDuration(model, 'millisecond').val,
  }
})

const model = computed({
  get() {
    return props.emptyValue === modelOriginal.value
      ? props.emptyValue
      : modelByUnit.value[durationUnit.value]
  },
  set(val) {
    let duration: IDurationInputProps['modelValue']

    if (typeof val === 'number') {
      duration = val * MODIFIER_BY_UNIT[durationUnit.value]
    } else {
      duration = val
    }

    modelOriginal.value = duration
  },
})

// Units
const units = computed(() => {
  return props.allowedUnits.map(unit => ({
    id: unit,
    label: $t(`general.${unit}`, 2),
    class: durationUnit.value === unit ? 'bg-primary color-white' : '',
    handler: () => handleDurationUnitChange(unit),
  }))
})

function handleDurationUnitChange(unit: DurationUnit) {
  const isEmptyValue = props.emptyValue === model.value
  durationUnit.value = unit

  nextTick(() => {
    model.value = isEmptyValue ? props.emptyValue : modelByUnit.value[unit]
  })

  menuEl.value?.hide()
}

defineExpose({
  isTouched: () => numberInputEl.value?.isTouched() ?? false,
  focus: () => numberInputEl.value?.focus(),
  select: () => numberInputEl.value?.select(),
  blur: () => numberInputEl.value?.blur(),
})
</script>

<template>
  <NumberInput
    ref="numberInputEl"
    v-bind="mergeProps($props, $attrs)"
    v-model="model"
    :ui="mergedProps.ui"
    @focus="$emit('focus')"
    @blur="$emit('blur')"
  >
    <!-- Label -->
    <template
      v-if="$slots.label"
      #label="labelProps"
    >
      <slot
        name="label"
        v-bind="labelProps"
      />
    </template>

    <!-- Prepend -->
    <template
      v-if="$slots.prepend"
      #prepend="slotProps"
    >
      <slot
        name="prepend"
        v-bind="slotProps"
      />
    </template>

    <!-- Append -->
    <template #append="slotProps">
      <slot
        name="append"
        v-bind="slotProps"
      />

      <!-- Unit selection -->
      <Btn
        v-if="!readonly && !disabled"
        flex="shrink"
        :label="$t(`general.${durationUnit}`, Math.round(model)).toLowerCase()"
        size="xs"
        no-uppercase
        no-bold
        color="ca"
        tabindex="-1"
        @mousedown.stop.prevent
        @click.stop.prevent
      >
        <Menu
          ref="menuEl"
          cover
          no-transition
          :fit="false"
          :ui="{ contentClass: ({ defaults }) => `${defaults.base} p-1 w-35 gap-2px` }"
        >
          <template #default>
            <Btn
              v-for="unit in units"
              :key="unit.id"
              :label="unit.label"
              :class="unit.class"
              size="sm"
              no-bold
              no-uppercase
              @click="unit.handler"
              @mousedown.stop.prevent
            />
          </template>
        </Menu>
      </Btn>
    </template>
  </NumberInput>
</template>
