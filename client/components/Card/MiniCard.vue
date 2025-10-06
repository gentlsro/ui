<script setup lang="ts">
// Types
import type { IMiniCardProps } from './types/mini-card-props.type'

// Functions
import { useValueFormatterUtils } from '../ValueFormatter/functions/useValueFormatterUtils'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

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
</script>

<template>
  <div class="value-container-card">
    <div
      v-if="$slots.icon || icon"
      class="value-container-card__icon"
    >
      <slot name="icon">
        <div
          v-if="icon"
          :class="[icon, mergedProps.ui?.iconClass]"
          :style="mergedProps.ui?.iconStyle"
        />
      </slot>
    </div>

    <div class="value-container-card__content">
      <slot
        name="label"
        :ui="mergedProps.ui"
      >
        <div
          class="value-container-card-label"
          :class="mergedProps.ui?.labelClass"
          :style="mergedProps.ui?.labelStyle"
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
                mergedProps.ui?.valueClass,
                { 'font-semibold': !noBold, 'is-modified': isModified },
              ]"
              :style="mergedProps.ui?.valueStyle"
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
                mergedProps.ui?.valueClass,
                { 'font-semibold': !noBold, 'is-modified': isModified },
              ]"
              :style="mergedProps.ui?.valueStyle"
            >
              <span class="link__label">
                <span class="link__label-icon" />
                <span>{{ getShownValue(val) }}</span>

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
              :class="[mergedProps.ui?.previousValueClass, { 'font-semibold': !noBold }]"
              :style="mergedProps.ui?.previousValueStyle"
            >
              {{ getShownValue(val) }}
            </span>

            <NuxtLink
              v-else
              :to="toPreviousValue"
              class="link"
              :class="[mergedProps.ui?.previousValueClass, { 'font-semibold': !noBold }]"
              :style="mergedProps.ui?.previousValueStyle"
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
            :ui="{ contentClass: 'p-2' }"
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
.value-container-card {
  @apply flex rounded-custom p-x-2 p-y-1 flex-gap-2;

  &__icon {
    @apply shrink-0 m-t-.5;
  }

  &-label {
    @apply text-caption;
  }

  &__value {
    overflow-wrap: break-word;
    white-space: pre-line;

    &.is-modified {
      @apply p-l-1 rounded-custom;
    }
  }

  &__content {
    @apply w-full leading-4.5 flex flex-col;
  }

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

    &.is-modified {
      @apply p-l-1 rounded-custom;
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
