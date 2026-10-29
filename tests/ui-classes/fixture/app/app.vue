<script setup lang="ts">
import type { IListProps } from '#layers/ui/app/components/List/types/list-props.type'
import { Day } from '#layers/utilities/app/models/day.model'
import fixtureConfig from './ui-config'

const hydrated = ref(false)
const selectorEl = useTemplateRef('selectorEl')
const size = ref<'sm' | 'lg'>('sm')
const contained = ref(false)
const checked = ref(false)
const selected = ref(false)
const text = ref('Initial')
const options = [{ id: 1, label: 'One' }, { id: 2, label: 'Two' }]
const day = new Day('2026-10-24', {
  periodStart: $date('2026-10-01'),
  periodEnd: $date('2026-10-31'),
})
const appBadge = (value: 'badge-app') => value
const appInput = (value: 'input-app') => value
const appList = (value: 'list-app') => value

// Failure modes: callbacks mistaken for factories, missing optional defaults,
// deep merging or mutation, and leaking unconfigured props into merged output.
const helperDefaults = getComponentProps('helperExtension')
const helperDefaultUI = helperDefaults.ui()
const helperOverrides = {
  ui: {
    base: 'helper-override',
    nested: { winner: 'override' },
  },
  callback: () => 'unused-override',
}
const originalHelperDefaults = JSON.stringify(helperDefaultUI)
const originalHelperOverrides = JSON.stringify(helperOverrides)
const helperMerged = getComponentMergedProps('helperExtension', helperOverrides)
const helperTooltip = getComponentMergedProps('chip', { tooltip: { label: 'optional-tooltip' } })
const helperButtons = getComponentMergedProps('crudBtns', { btnProps: { label: 'optional-button' } })
const helperResults = {
  defaults: {
    objectFactory: typeof helperDefaults.ui === 'function' && helperDefaultUI.base === 'helper-default',
    arrayFactory: typeof helperDefaults.labels === 'function' && helperDefaults.labels()[0] === 'helper-default',
    callbackPreserved: helperDefaults.callback === fixtureConfig.helperExtension.props.callback,
    callbackResult: helperDefaults.callback('value'),
    tableCallbackResult: getComponentProps('table').getFilterComponent() === undefined,
  },
  merged: {
    keys: Object.keys(helperMerged),
    base: helperMerged.ui.base,
    retained: helperMerged.ui.retained,
    nested: helperMerged.ui.nested,
    callbackPreserved: helperMerged.ui.handler === helperDefaultUI.handler,
    unchangedDefaults: JSON.stringify(helperDefaults.ui()) === originalHelperDefaults,
    unchangedOverrides: JSON.stringify(helperOverrides) === originalHelperOverrides,
  },
  missingDefaults: {
    tooltip: helperTooltip.tooltip?.label,
    button: helperButtons.btnProps?.label,
  },
  emptyMergeKeys: Object.keys(getComponentMergedProps('elementMovement', {})),
  optionalMergeAbsent: getComponentMergedProps('helperOptionalMerge', {}) === undefined,
}

const selectorListProps: Partial<IListProps> & { 'data-testid': string } = {
  'data-testid': 'selector-list',
  'ui': {
    containerClass: ({ defaults }) => defaults.p('base', 'theme', 'brand', 'application'),
  },
}

onMounted(() => {
  hydrated.value = true
})
</script>

<template>
  <main class="verification">
    <h1>Layered UI class defaults</h1>
    <output data-testid="hydrated">{{ hydrated }}</output>
    <pre data-testid="helper-results">{{ JSON.stringify(helperResults) }}</pre>
    <Badge
      data-testid="badge-default"
      :counter="1"
    />
    <Badge
      data-testid="badge-picked"
      :counter="2"
      :ui="{ containerClass: ({ defaults }) => `${appBadge(defaults.base)} ${defaults.p('inline', 'theme', 'brand', 'application', 'topRight')}` }"
    />
    <Section
      data-testid="section"
      title="Section"
      :ui="{ containerClass: ({ defaults }) => defaults.p('base', 'theme', 'brand', 'application') }"
    >
      Layered section
    </Section>
    <Checkbox
      v-model="checked"
      data-testid="checkbox"
      label="Checkbox"
      :size
    />
    <Toggle
      v-model="checked"
      data-testid="toggle"
      label="Toggle"
      :size
      :contained
      :ui="{ toggleClass: ({ defaults }) => defaults.p('base', 'size') }"
    />
    <DatePickerDay
      data-testid="date-day"
      :day
      :is-selected="selected"
      :edge="false"
    />
    <TextInput
      v-model="text"
      data-testid="text-wrapper"
      label="Input inherits InputWrapper classes"
      :input-props="{ 'data-testid': 'text-control' }"
      :ui="{ wrapperClass: ({ defaults }) => `${appInput(defaults.base)} ${defaults.p('theme', 'brand', 'application')}` }"
    />
    <output data-testid="text-value">{{ text }}</output>
    <List
      data-testid="list"
      :items="options"
      :search-config="{ enabled: false }"
      :ui="{ containerClass: ({ defaults }) => `${appList(defaults.base)} ${defaults.p('theme', 'brand', 'application')}` }"
    />
    <Selector
      ref="selectorEl"
      data-testid="selector"
      :options
      label="Nested list"
      :no-search="true"
      :list-props="selectorListProps"
    />
    <Btn
      data-testid="selector-open"
      label="Open selector"
      @click="selectorEl?.focus()"
    />
    <Btn
      data-testid="button-regression"
      label="Button regression"
      :ui="{ containerClass: ({ defaults }) => defaults.p('base', 'theme', 'brand', 'application') }"
    />
    <Btn
      data-testid="size-toggle"
      label="Toggle size"
      @click="size = size === 'sm' ? 'lg' : 'sm'"
    />
    <Btn
      data-testid="contained-toggle"
      label="Toggle contained"
      @click="contained = !contained"
    />
    <Btn
      data-testid="date-toggle"
      label="Toggle selected day"
      @click="selected = !selected"
    />
  </main>
</template>

<style scoped>
.verification {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 24px;
}

.verification > pre {
  max-width: 100%;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
