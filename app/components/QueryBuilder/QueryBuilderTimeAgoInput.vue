<script setup lang="ts" vapor>
// Types
import type { IQueryBuilderItem } from './types/query-builder-item-props.type'

type IAgoValue = {
  value?: number | null | undefined
  unit: string
  unitShortName: string
}

type IExactInputProps = {
  /**
   * The initial value for `isExact` input
   */
  value: boolean
  /**
   * Indicates should exact selection button be disabled
   */
  isButtonDisabled?: boolean
}

type IProps = {
  item: Pick<IQueryBuilderItem, 'value' | 'comparator'>
  exactInputOptions?: IExactInputProps
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

defineExpose({
  focus: () => inputEl.value?.focus(),
})

// Layout
const inputEl = useTemplateRef('inputEl')
const menuEl = useTemplateRef('menuEl')
const item = toRef(props, 'item')
const exactInputOptions = toRef(props, 'exactInputOptions')
const preferredUnit = ref('m')
const preferredExact = ref(false)

const units = computed(() => [
  { id: 'd', label: $t('general.day', agoValue.value.value ?? 0) },
  { id: 'w', label: $t('general.week', agoValue.value.value ?? 0) },
  { id: 'm', label: $t('general.month', agoValue.value.value ?? 0) },
  { id: 'y', label: $t('general.year', agoValue.value.value ?? 0) },
])

// ComapratorEnum.AGO, CoparatorEnum.NOT_AGO, ComparatorEnum.UNTIL, ComparatorEnum.NOT_UNTIL
const agoValue = computed({
  get() {
    const matches = String(item.value.value ?? '').match(/^(\d+(?:\.\d+)?)([dwmy])(e?)$/i)
    const shortUnit = matches?.[2]?.toLowerCase() ?? preferredUnit.value
    const exact = matches ? !!matches[3] : preferredExact.value
    const unit = ({ d: 'day', w: 'week', m: 'month', y: 'year' })[shortUnit as 'd' | 'w' | 'm' | 'y']

    return {
      value: matches ? Number.parseFloat(matches[1]!) : undefined,
      unit,
      unitShortName: `${shortUnit}${exact ? 'e' : ''}`,
    } satisfies IAgoValue
  },
  set(update: Partial<IAgoValue>) {
    const value = 'value' in update ? update.value : agoValue.value.value
    const unit = update.unitShortName ?? agoValue.value.unitShortName
    // A cleared number stays empty while the user's unit/exact choice survives.
    preferredUnit.value = unit.replace(/e$/, '')
    preferredExact.value = unit.endsWith('e')
    item.value.value = isNil(value) ? '' : `${value}${unit}`

    emits('update:modelValue', item.value.value)
  },
})

const isExact = computed({
  get() {
    return !!agoValue.value?.unitShortName?.endsWith('e')
  },
  set(val: boolean) {
    if (val) {
      agoValue.value = {
        unitShortName: `${agoValue.value.unitShortName}e`,
      }
    } else {
      agoValue.value = {
        unitShortName: agoValue.value.unitShortName?.replace(/e$/, ''),
      }
    }
  },
})

function setNumber(value: number | null | undefined) {
  agoValue.value = { value }
}

// Set isExact value from exactInputOptions props, if provided
if (exactInputOptions.value && exactInputOptions.value.value !== isExact.value) {
  isExact.value = exactInputOptions.value.value
}

function setUnit(unitShortName: string) {
  agoValue.value = {
    unitShortName: isExact.value ? `${unitShortName}e` : unitShortName,
  }

  menuEl.value?.hide()
}
</script>

<template>
  <NumberInput
    ref="inputEl"
    :model-value="agoValue.value"
    size="sm"
    layout="regular"
    :mask="{ mask: /^\d+$/ }"
    class="qb-item__content-value"
    @update:model-value="setNumber"
  >
    <template #append>
      <div flex="~ gap-1">
        <Btn
          flex="shrink"
          :label="$t(`general.${agoValue.unit}`, Math.round(agoValue.value ?? 0) || 0).toLowerCase()"
          size="xs"
          no-uppercase
          no-bold
          color="ca"
          tabindex="-1"
          w="16"
          @click.stop.prevent
          @mousedown.stop.prevent
        >
          <Menu
            ref="menuEl"
            w="40"
            :fit="false"
          >
            <template #default>
              <Btn
                v-for="unit in units"
                :key="unit.id"
                :label="unit.label"
                size="sm"
                no-bold
                no-uppercase
                @click="setUnit(unit.id)"
                @mousedown.stop.prevent=""
              />
            </template>
          </Menu>
        </Btn>

        <Btn
          size="xs"
          :class="{
            'color-white !bg-primary': isExact,
            'color-ca': !isExact,
          }"
          no-bold
          no-uppercase
          :label="$t('table.exactFilter')"
          :disabled="exactInputOptions?.isButtonDisabled"
          :aria-pressed="isExact"
          @click="isExact = !isExact"
        />
      </div>
    </template>
  </NumberInput>
</template>
