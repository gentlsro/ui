<script setup lang="ts">
type IProps = {
  view: 'months' | 'years'
  date: Datetime
  years: number[]
  utc?: boolean
}

const props = defineProps<IProps>()
const emits = defineEmits<{
  select: [value: number]
  navigate: [direction: number]
}>()

// Utils
const { formatDate } = useDateUtils()

const transitionName = ref('years-next')
watch(() => props.years[0], (year, previous) => {
  if (!isNil(year) && !isNil(previous)) {
    transitionName.value = year > previous ? 'years-next' : 'years-previous'
  }
})

const period = useTemplateRef('period')
let suppressClick = false

usePointerSwipe(() => props.view === 'years' ? period.value : null, {
  threshold: 50,
  onSwipeStart: () => suppressClick = false,
  onSwipe: () => suppressClick = true,
  onSwipeEnd(event, direction) {
    if (event.type === 'pointercancel' || props.view !== 'years') {
      return
    }

    if (direction === 'left' || direction === 'right') {
      emits('navigate', direction === 'left' ? 1 : -1)
    }
  },
})

function handleClick(event: MouseEvent) {
  // A drag must not select the year where the gesture started.
  if (suppressClick) {
    event.preventDefault()
    event.stopPropagation()
    suppressClick = false
  }
}

// Layout
const dateObj = computed(() => $date(props.date, { utc: props.utc }))
const selected = computed(() => props.view === 'months' ? dateObj.value.month() : dateObj.value.year())

const options = computed(() => {
  return props.view === 'months'
    ? Array.from({ length: 12 }, (_, value) => ({
        value,
        label: formatDate(dateObj.value.month(value), props.utc ? 'utcMonth' : 'month'),
      }))
    : props.years.map(value => ({ value, label: String(value) }))
})
</script>

<template>
  <div
    ref="period"
    class="date-picker-period"
    :class="{ 'date-picker-period--years': view === 'years' }"
    @click.capture="handleClick"
  >
    <Btn
      v-if="view === 'years'"
      size="auto"
      icon="i-majesticons:chevron-left w-5 h-5"
      :ui="{ containerClass: ({ defaults }) => `${defaults.all} w-8 h-8 shrink-0 self-center p-0` }"
      :aria-label="`${$t('general.previous')} ${$t('general.year', 2)}`"
      data-picker-previous-years
      @click="$emit('navigate', -1)"
    />

    <div class="date-picker-pages">
      <Transition
        :name="transitionName"
        :css="view === 'years'"
        @before-enter="el => el.removeAttribute('inert')"
        @before-leave="el => el.setAttribute('inert', '')"
      >
        <div
          :key="view === 'years' ? years[0] : view"
          class="date-picker-choices"
          :class="{ 'date-picker-choices--years': view === 'years' }"
          :data-picker-month-grid="view === 'months' ? '' : undefined"
          :data-picker-year-grid="view === 'years' ? '' : undefined"
        >
          <Btn
            v-for="option in options"
            :key="option.value"
            no-uppercase
            size="auto"
            :ui="{ containerClass: ({ defaults }) => `${defaults.all} capitalize min-w-0 p-0` }"
            :label="option.label"
            :aria-pressed="selected === option.value"
            :class="{ 'is-selected': selected === option.value }"
            :data-picker-month="view === 'months' ? option.value : undefined"
            :data-picker-year="view === 'years' ? option.value : undefined"
            @click="$emit('select', option.value)"
          />
        </div>
      </Transition>
    </div>

    <Btn
      v-if="view === 'years'"
      size="auto"
      icon="i-majesticons:chevron-right w-5 h-5"
      :ui="{ containerClass: ({ defaults }) => `${defaults.all} w-8 h-8 shrink-0 self-center p-0` }"
      :aria-label="`${$t('general.next')} ${$t('general.year', 2)}`"
      data-picker-next-years
      @click="$emit('navigate', 1)"
    />
  </div>
</template>

<style scoped lang="scss">
.date-picker-period {
  @apply flex min-w-0;

  &--years {
    @apply px-2;

    touch-action: pan-y;
  }
}

.date-picker-pages {
  @apply grid flex-1 min-w-0 overflow-hidden;

  > * {
    grid-area: 1 / 1;
  }
}

.years-next-enter-active,
.years-next-leave-active,
.years-previous-enter-active,
.years-previous-leave-active {
  transition:
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 240ms ease;
}

.years-next-leave-active,
.years-previous-leave-active {
  pointer-events: none;
}

.years-next-enter-from,
.years-previous-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.years-next-leave-to,
.years-previous-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .years-next-enter-active,
  .years-next-leave-active,
  .years-previous-enter-active,
  .years-previous-leave-active {
    transition: none;
  }
}

.date-picker-choices {
  @apply grid min-w-0 grid-cols-3 grid-rows-4 gap-1 p-2;

  &--years {
    @apply grid-cols-4 grid-rows-6 px-0;
  }

  .is-selected {
    @apply bg-primary color-white;
  }
}
</style>
