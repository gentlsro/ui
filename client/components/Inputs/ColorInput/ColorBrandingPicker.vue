<script setup lang="ts">
import colors from '../../../../shared/constants/colors.json'

// Functions
import { useColors } from '../../../../shared/composables/useColors'

// Constants
import { GENERIC_COLORS, THEME_COLORS } from './constants/brand-colors'

type IProps = {
  disallowedColors?: string[]
  modelValue?: string
  rgba?: boolean
}

const props = defineProps<IProps>()

// Utils
const { getColor, hexToRgb, rgbaToHex, isRgba } = useColors()

// Layout
const model = defineModel<string>()
const { isSupported, open: openEyeDropper, sRGBHex } = useEyeDropper()

const themeColors = computed(() => {
  const hasWhite = !props.disallowedColors?.includes('white')
  const hasBlack = !props.disallowedColors?.includes('black')

  return [
    ...(hasWhite ? ['#FFFFFF'] : []),
    ...(hasBlack ? ['#000000'] : []),
    ...THEME_COLORS.map(color => getColor(color, undefined, true)),
  ] as string[]
})

const colorSelected = computed(() => {
  if (!model.value) {
    return undefined
  }

  return isRgba(model.value) ? rgbaToHex(model.value) : model.value
})

const standardColorsByColumn = computed(() => {
  const _colors = pick(colors, GENERIC_COLORS)
  const _disallowedColors = props.disallowedColors?.map(color => color.toLocaleLowerCase()) ?? []

  return Object.entries(_colors).reduce((agg, [key, value]) => {
    const colorShades = new Set(Object.values(value as any))

    agg[key] = Array.from(colorShades) as string[]

    if (agg[key]) {
      agg[key]?.splice(agg[key]!.length - 2, 1)
    }

    // Pick every second color
    agg[key] = agg[key]
      ?.filter((_, i) => i % 2 === 0)
      .filter((color: any) => {
        return !_disallowedColors?.includes(color)
      })

    return agg
  }, {} as Record<string, string[]>)
})

const opacity = computed({
  get() {
    if (model.value?.startsWith('rgba')) {
      return Number(model.value?.split(', ')?.[3]?.replace(')', '')) * 100
    }

    return undefined
  },
  set(val) {
    if (model.value?.startsWith('rgba')) {
      // Remove `rgba(` and `)`
      const _model = model.value.replace(/^rgba\(|\)$/g, '')
      const [r, g, b, _] = _model.split(',').map(trim)

      model.value = `rgba(${r}, ${g}, ${b}, ${(val ?? 0) / 100})`
    }
  },
})

watch(sRGBHex, value => {
  if (value && props.rgba) {
    model.value = hexToRgb(value)
  } else {
    model.value = value
  }
})

// Methods
function setColor(color: string) {
  if (!props.rgba) {
    model.value = color

    return
  }

  model.value = hexToRgb(color)

  if (!props.rgba) {
    $hide()
  }
}
</script>

<template>
  <div flex="~ col gap-y-3">
    <!-- Theme colors -->
    <div flex="~ col gap-y-px wrap">
      <div text="caption">
        {{ $t('color.theme') }}
      </div>

      <div flex="~ justify-between">
        <div grid="~ flow-col gap-x-px">
          <div
            class="color-block"
            p="x-2"
            w="!fit"
            border="1 ca"
            text="center"
            leading="none"
            flex="~ center"
            @click="model = undefined"
          >
            {{ $t('color.auto') }}
          </div>

          <div
            v-for="themeColor in themeColors"
            :key="themeColor"
            :style="{ backgroundColor: themeColor }"
            class="color-block"
            :class="{ 'is-selected': lowerCase(colorSelected) === lowerCase(themeColor) }"
            @click="setColor(themeColor)"
          />
        </div>

        <div grid="~ flow-col gap-x-px">
          <button
            v-if="isSupported"
            class="color-block"
            flex="~ center"
            @click="openEyeDropper()"
          >
            <div class="i-mdi:eyedropper" />
          </button>
        </div>
      </div>
    </div>

    <!-- Standard colors -->
    <div flex="~ col">
      <div
        w="full"
        text="caption"
      >
        {{ $t('color.standard') }}
      </div>

      <div grid="~ gap-x-px flow-col">
        <div
          v-for="(shades, colorKey) in standardColorsByColumn"
          :key="colorKey"
          grid="~ gap-y-px"
        >
          <div
            v-for="shade in shades"
            :key="shade"
            :style="{ backgroundColor: shade }"
            :class="{ 'is-selected': colorSelected === shade }"
            class="color-block"
            @click="setColor(shade)"
          />
        </div>
      </div>

      <!-- Opacity -->
      <div
        v-if="typeof opacity === 'number' && rgba"
        flex="~ gap-2"
      >
        <div class="i-ic:sharp-opacity self-center color-ca m-l-1" />

        <RangeInput
          v-model.number="opacity"
          :step="5"
          h="10"
          grow
        />

        <NumberInput
          v-model="opacity"
          size="sm"
          :min="0"
          :max="100"
          :step="5"
          w="!20"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.color-block {
  @apply h-6 w-6 hover:shadow-consistent shadow-ca hover:z-1 cursor-pointer;

  &.is-selected {
    @apply outline outline-1 outlined-solid outline-offset-1 z-1;
  }
}
</style>
