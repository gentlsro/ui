import { describe, expect, it } from 'vitest'
import { computed, defineComponent, h, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import type { ISelectorProps } from '../components/Selector/types/selector-props.type'
import { useSelectorStore } from '../components/Selector/stores/selector.store'
import { getComponentMergedProps, getComponentProps } from './get-component-props'

function mountOwner() {
  let store: ReturnType<typeof useSelectorStore>
  const defaults = getComponentProps('selector')
  const wrapper = mount(defineComponent({
    props: {
      modelValue: { default: undefined },
      search: String,
      addedItems: { type: Array, default: defaults.addedItems },
      loading: { type: Boolean, default: defaults.loading },
      options: Array,
    },
    emits: ['update:modelValue', 'update:search', 'update:addedItems', 'update:loading', 'update:options'],
    setup(props) {
      store = useSelectorStore({ props: props as ISelectorProps })

      return () => h('span')
    },
  }))

  return { wrapper, store: store! }
}

describe('configured props and store models', () => {
  it('owns local models while emitting updates from the owning component', () => {
    const { wrapper, store } = mountOwner()
    try {
      store.model.value = 7
      store.search.value = 'Alpha'
      expect(store.model.value).toBe(7)
      expect(store.search.value).toBe('Alpha')
      expect(wrapper.emitted('update:modelValue')).toEqual([[7]])
      expect(wrapper.emitted('update:search')).toEqual([['Alpha']])
      store.model.value = null
      expect(store.model.value).toBeNull()
      store.model.value = undefined
      expect(store.model.value).toBeUndefined()
    } finally {
      wrapper.unmount()
    }
  })

  it('creates independent arrays from configured defaults for each owner', () => {
    const first = mountOwner()
    const second = mountOwner()
    try {
      expect(first.store.addedItems.value).toEqual([])
      expect(first.store.isLoading.value).toBe(false)
      first.store.addedItems.value!.push({ id: 1, label: 'Local option' })
      expect(second.store.addedItems.value).toEqual([])
      expect(getComponentProps('selector').addedItems()).toEqual([])
    } finally {
      first.wrapper.unmount()
      second.wrapper.unmount()
    }
  })

  it('retains configured UI callbacks when instance overrides change', () => {
    const callback = () => 'instance-label'
    const input = reactive<ISelectorProps>({ ui: { labelClass: callback } })
    const props = computed(() => getComponentMergedProps('selector', input))
    const configuredUI = getComponentProps('selector').ui()
    expect(props.value.ui.labelClass).toBe(callback)
    expect(props.value.ui.inputClass).toBe(configuredUI.inputClass)
    expect(input.ui).toEqual({ labelClass: callback })
    input.ui = { borderRadius: '2rem' }
    expect(props.value.ui.borderRadius).toBe('2rem')
    expect(props.value.ui.labelClass).toBe(configuredUI.labelClass)
  })
})
