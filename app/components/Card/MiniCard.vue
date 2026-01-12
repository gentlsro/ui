<script setup lang="ts">
// Types
import type { IMiniCardProps } from './types/mini-card-props.type'

// Constants
import { MINI_CARD_DEFAULT_PROPS } from './constants/mini-card-default-props.constant'

// Functions
import { useValueFormatterUtils } from '../ValueFormatter/functions/useValueFormatterUtils'

const props = withDefaults(defineProps<IMiniCardProps>(), {
  ...getComponentProps('miniCard'),
})

// Utils
const { getValueFormatterProps } = useValueFormatterUtils()

const mergedProps = computed(() => {
  return getComponentMergedProps('miniCard', props)
})

// Layout
const valueFormatterProps = getValueFormatterProps(props)
const [DefineTemplate, OriginalValueBtn] = createReusableTemplate()

const label = computed(() => {
  return typeof props.label === 'function'
    ? props.label()
    : props.label
})

function getShownValue(val: any) {
  if (isNil(val) || val === '' || (Array.isArray(val) && val.length === 0)) {
    return props.emptyValueString
  }

  return val
}

const isModified = computed(() => {
  if (props.originalValue === undefined) {
    return false
  }

  return !isEqual(props.originalValue, props.value)
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: MINI_CARD_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - icon container
const iconContainerClass = computed(() => {
  return mergedProps.value?.ui?.iconContainerClass?.({
    defaults: MINI_CARD_DEFAULT_PROPS.ui.iconContainerClass(),
  })
})

const iconContainerStyle = computed(() => {
  return mergedProps.value?.ui?.iconContainerStyle?.()
})

// Styles - icon
const iconClass = computed(() => {
  return mergedProps.value?.ui?.iconClass?.({
    defaults: MINI_CARD_DEFAULT_PROPS.ui.iconClass(),
  })
})

const iconStyle = computed(() => {
  return mergedProps.value?.ui?.iconStyle?.()
})

// Styles - content
const contentClass = computed(() => {
  return mergedProps.value?.ui?.contentClass?.({
    defaults: MINI_CARD_DEFAULT_PROPS.ui.contentClass(),
  })
})

const contentStyle = computed(() => {
  return mergedProps.value?.ui?.contentStyle?.()
})

// Styles - label
const labelClass = computed(() => {
  return mergedProps.value?.ui?.labelClass?.({
    defaults: MINI_CARD_DEFAULT_PROPS.ui.labelClass(),
  })
})

const labelStyle = computed(() => {
  return mergedProps.value?.ui?.labelStyle?.()
})

// Styles - value
const valueClass = computed(() => {
  return mergedProps.value?.ui?.valueClass?.({
    defaults: MINI_CARD_DEFAULT_PROPS.ui.valueClass(),
  })
})

const valueStyle = computed(() => {
  return mergedProps.value?.ui?.valueStyle?.()
})

// Styles - previous value
const previousValueClass = computed(() => {
  return mergedProps.value?.ui?.previousValueClass?.({
    defaults: MINI_CARD_DEFAULT_PROPS.ui.previousValueClass(),
  })
})

const previousValueStyle = computed(() => {
  return mergedProps.value?.ui?.previousValueStyle?.()
})
</script>

<template>
  <div
    class="value-container-card group"
    :class="containerClass"
    :style="containerStyle"
  >
    <div
      v-if="$slots.icon || icon"
      class="value-container-card__icon"
      :class="iconContainerClass"
      :style="iconContainerStyle"
    >
      <slot name="icon">
        <div
          v-if="icon"
          :class="[icon, iconClass]"
          :style="iconStyle"
        />
      </slot>
    </div>

    <div
      class="value-container-card__content"
      :class="contentClass"
      :style="contentStyle"
    >
      <slot
        name="label"
        :ui="mergedProps.ui"
      >
        <div
          class="value-container-card-label"
          :class="labelClass"
          :style="labelStyle"
        >
          {{ label }}
        </div>
      </slot>

      <ValueFormatter v-bind="valueFormatterProps">
        <template #default="{ val }">
          <slot :val="val">
            <!-- Current value -->
            <span
              v-if="!to || !val"
              class="value-container-card__value"
              :class="[
                valueClass,
                { 'font-semibold': !noBold, 'is-modified': isModified },
              ]"
              :style="valueStyle"
            >
              {{ getShownValue(val) }}

              <OriginalValueBtn v-if="isModified" />
            </span>

            <NuxtLink
              v-else
              :to="typeof to === 'function'
                ? to({ value, parsedValue: val, label: getShownValue(val) })
                : to"
              class="link"
              v-bind="navigateToOptions"
              :class="[
                valueClass,
                { 'font-semibold': !noBold, 'is-modified': isModified },
              ]"
              :style="valueStyle"
            >
              <span class="link__label">
                <span class="link__label-icon" />
                <span class="link__label-text p-l-1">{{ getShownValue(val) }}</span>

                <OriginalValueBtn v-if="isModified" />
              </span>
            </NuxtLink>

            <slot name="value-append" />
          </slot>
        </template>

        <!-- Previous Value -->
        <template
          v-if="previousValue !== undefined"
          #previousValue="{ val }"
        >
          <div m-t-2>
            <span
              v-if="!toPreviousValue || !val"
              class="value-container-card__value"
              :class="[previousValueClass, { 'font-semibold': !noBold }]"
              :style="previousValueStyle"
            >
              {{ getShownValue(val) }}
            </span>

            <NuxtLink
              v-else
              :to="toPreviousValue"
              class="link"
              :class="[previousValueClass, { 'font-semibold': !noBold }]"
              :style="previousValueStyle"
            >
              <span class="link__label">
                <span class="link__label-icon" />
                <span>{{ getShownValue(val) }}</span>
              </span>
            </NuxtLink>
          </div>
        </template>
      </ValueFormatter>
    </div>

    <DefineTemplate>
      <span
        inline-block
        bg="purple-500 dark:purple-600"
        rounded="full"
      >
        <Btn
          size="xs"
          round
          icon="i-solar:history-outline !h-5 !w-5"
          color="white"
          no-dim
        >
          <Menu
            no-uplift
            w="80"
          >
            <span
              font="bold"
              text="caption"
            >
              {{ $t('general.currentValue') }}
            </span>

            <ValueFormatter
              v-bind="valueFormatterProps"
              :value="originalValue"
            >
              <template #default="{ val }">
                {{ getShownValue(val) }}
              </template>
            </ValueFormatter>
          </Menu>
        </Btn>
      </span>
    </DefineTemplate>
  </div>
</template>

<style scoped lang="scss">
// Link hover effects with complex gradients - kept in SCSS as they can't be easily expressed in UnoCSS
.link {
  @apply decoration-none;
  overflow-wrap: break-word;
  white-space: pre-line;

  &__label {
    @apply relative;

    &::before {
      @apply content-empty inline-block w-4 min-w-4;
    }

    &:hover {
      @apply color-blue-500 dark:color-blue-700;

      background-image: linear-gradient(
        to bottom,
        transparent 0%,
        transparent calc(100% - 1px),
        theme('colors.blue.500') calc(100% - 1px),
        theme('colors.blue.500') 100%
      );
      background-size: 100% 100%;
      background-repeat: no-repeat;
      background-position: 0% 100%;
    }

    &-icon {
      // top-0.4 makes the icon align with text, no deeper meaning
      @apply i-ph:link min-h-4 h-4 min-w-4 w-4 absolute left-0 top-0.4;
    }
  }
}

.dark {
  .link {
    &__label {
      &:hover {
        background-image: linear-gradient(
          to bottom,
          transparent 0%,
          transparent calc(100% - 1px),
          theme('colors.blue.700') calc(100% - 1px),
          theme('colors.blue.700') 100%
        );
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: 0% 100%;
      }
    }
  }
}
</style>
