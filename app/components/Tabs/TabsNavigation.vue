<script setup lang="ts" vapor>
// Types
import type { ITabProps } from './types/tab-props.type'
import type { ITabsProps } from './types/tabs-props.type'
import type { useTabsUtils } from './composables/useTabsUtils'

// Constants
import { TABS_DEFAULT_PROPS } from './constants/tabs-default-props.constant'

type IProps = {
  modelValue?: string | number
  tabs: ReturnType<typeof useTabsUtils>['navigation']['value']
  label?: string
  activationMode?: ITabsProps['activationMode']
  ui?: ITabsProps['ui']
}

const props = defineProps<IProps>()

// Layout
const model = defineModel<string | number>()
const listEl = useTemplateRef<HTMLDivElement>('listEl')
const focusedId = ref<number>()
const enabledTabs = computed(() => props.tabs.filter((tab, index) => !tab.props.btnProps?.(model.value === tab.name, index)?.disabled))
const entryId = computed(() => focusedId.value ?? enabledTabs.value.find(tab => tab.name === model.value)?.id ?? enabledTabs.value[0]?.id)

function focusTab(tab: IProps['tabs'][number]) {
  focusedId.value = tab.id
  const element = listEl.value?.ownerDocument.getElementById(tab.tabId)
  element?.focus({ preventScroll: true })
  element?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

function selectTab(tab: IProps['tabs'][number]) {
  if (enabledTabs.value.some(enabled => enabled.id === tab.id)) {
    model.value = tab.name
  }
}

function getButtonProps(tab: IProps['tabs'][number], index: number) {
  return {
    ...tab.props.btnProps?.(model.value === tab.name, index),
    'id': tab.tabId,
    'role': 'tab',
    'type': 'button' as const,
    'to': undefined,
    'aria-controls': tab.panelId,
    'aria-selected': model.value === tab.name,
    'tabindex': entryId.value === tab.id ? 0 : -1,
    'onFocus': () => {
      focusedId.value = tab.id
      if (props.activationMode === 'automatic') {
        selectTab(tab)
      }
    },
    'onClick': () => selectTab(tab),
  }
}

function handleKeydown(event: KeyboardEvent) {
  const element = (event.target as HTMLElement).closest<HTMLElement>('[role="tab"]')
  if (!element || element.closest('[role="tablist"]') !== listEl.value) {
    return
  }
  const tabs = enabledTabs.value
  const index = tabs.findIndex(tab => tab.tabId === element.id)
  let next: IProps['tabs'][number] | undefined
  if (event.key === 'Home') {
    next = tabs[0]
  } else if (event.key === 'End') {
    next = tabs.at(-1)
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    const direction = event.key === 'ArrowRight' ? 1 : -1
    next = tabs[(index + direction + tabs.length) % tabs.length]
  }
  if (next) {
    event.preventDefault()
    focusTab(next)
  }
}

useEventListener(listEl, 'keydown', handleKeydown)
useEventListener(listEl, 'focusout', event => {
  if (!listEl.value?.contains(event.relatedTarget as Node | null)) {
    focusedId.value = undefined
  }
})
watch([() => model.value, enabledTabs], () => {
  if (focusedId.value !== undefined && !enabledTabs.value.some(tab => tab.id === focusedId.value)) {
    focusedId.value = undefined
    if (listEl.value?.contains(listEl.value.ownerDocument.activeElement)) {
      nextTick(() => {
        const next = enabledTabs.value.find(tab => tab.name === model.value) ?? enabledTabs.value[0]
        if (next) {
          focusTab(next)
        }
      })
    }
  }
})

// Styles - navigation
const navigationClass = computed(() => {
  return props.ui?.navigationClass?.({
    defaults: TABS_DEFAULT_PROPS.ui.navigationClass(),
  })
})

const navigationStyle = computed(() => {
  return props.ui?.navigationStyle?.()
})

// Styles - navigation content
const navigationContentClass = computed(() => {
  return props.ui?.navigationContentClass?.({
    defaults: TABS_DEFAULT_PROPS.ui.navigationContentClass(),
  })
})

const navigationContentStyle = computed(() => {
  return props.ui?.navigationContentStyle?.()
})

// Styles - tab nav btn
const tabNavBtnClass = computed(() => {
  return props.ui?.tabNavBtnClass?.({
    defaults: TABS_DEFAULT_PROPS.ui.tabNavBtnClass(),
  })
})

const tabNavBtnStyle = computed(() => {
  return props.ui?.tabNavBtnStyle?.()
})

function getLabel(tab: ITabProps) {
  if (typeof tab.label === 'function') {
    return tab.label()
  }

  return tab.label
}
</script>

<template>
  <HorizontalScroller
    :arrow-tabindex="-1"
    :content-tabindex="-1"
    class="tabs-navigation"
    :class="navigationClass"
    :style="navigationStyle"
    :ui="{
      contentClass: () => '',
    }"
  >
    <div
      ref="listEl"
      role="tablist"
      :aria-label="label ?? $t('tabs.label')"
      aria-orientation="horizontal"
      :class="navigationContentClass"
      :style="navigationContentStyle"
    >
      <slot
        v-for="(tab, idx) in tabs"
        :key="tab.id"
        :idx
        :name="`${tab.name}-label`"
        :btn-class="[{ 'is-active': model === tab.name }, tabNavBtnClass]"
        :btn-style="tabNavBtnStyle"
        :btn-props="getButtonProps(tab, idx)"
        :change-fn="() => selectTab(tab)"
      >
        <Btn
          :icon="tab.props.icon"
          :label="getLabel(tab.props) ?? tab.name"
          :class="[{ 'is-active': model === tab.name }, tabNavBtnClass]"
          :style="tabNavBtnStyle"
          v-bind="getButtonProps(tab, idx)"
        />
      </slot>
    </div>
  </HorizontalScroller>
</template>
