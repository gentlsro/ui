import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import type { PropType, Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { initRef } from '#layers/utilities/app/utils/init-ref'

type Value = string | null | undefined

function mountModel(options: {
  props?: { 'modelValue'?: Value, 'onUpdate:modelValue'?: (value: Value) => void }
  defaultValue?: Value
  initWith?: { condition: () => boolean, fnc: () => Value }
} = {}) {
  let model: Ref<Value>
  const wrapper = mount(defineComponent({
    props: { modelValue: { type: String as PropType<string | null>, default: undefined } },
    emits: ['update:modelValue'],
    setup(props) {
      model = initRef({
        props,
        propName: 'modelValue',
        defaultValue: options.defaultValue,
        initWith: options.initWith,
      })

      return () => h('span', model.value)
    },
  }), { props: options.props })

  return { wrapper, model: model! }
}

describe('initRef model wrapper', () => {
  it('uses a read fallback without emitting and preserves controlled null/reset updates', async () => {
    const update = vi.fn()
    const { wrapper, model } = mountModel({
      props: { 'modelValue': undefined, 'onUpdate:modelValue': update },
      defaultValue: 'fallback',
    })
    try {
      expect(model.value).toBe('fallback')
      expect(update).not.toHaveBeenCalled()
      model.value = 'requested'
      expect(update).toHaveBeenCalledWith('requested')
      expect(model.value).toBe('fallback')
      await wrapper.setProps({ modelValue: 'accepted' })
      expect(model.value).toBe('accepted')
      await wrapper.setProps({ modelValue: null })
      expect(model.value).toBeNull()
      await wrapper.setProps({ modelValue: undefined })
      expect(model.value).toBe('fallback')
    } finally {
      wrapper.unmount()
    }
  })

  it('initializes through the controlled model only when the condition matches', () => {
    const update = vi.fn()
    const initialized = mountModel({
      props: { 'modelValue': undefined, 'onUpdate:modelValue': update },
      initWith: { condition: () => true, fnc: () => 'initial' },
    })
    const skipped = vi.fn(() => 'unused')
    const untouched = mountModel({ initWith: { condition: () => false, fnc: skipped } })
    try {
      expect(update).toHaveBeenCalledExactlyOnceWith('initial')
      expect(initialized.model.value).toBeUndefined()
      expect(skipped).not.toHaveBeenCalled()
    } finally {
      initialized.wrapper.unmount()
      untouched.wrapper.unmount()
    }
  })

  it('supports local initialization and isolates mutable fallback values', () => {
    const fallback: number[] = []
    const first = initRef<{ value: number[] }, 'value'>({ propName: 'value', defaultValue: fallback })
    const second = initRef<{ value: number[] }, 'value'>({ propName: 'value', defaultValue: fallback })
    first.value.push(1)
    expect(second.value).toEqual([])
    expect(fallback).toEqual([])
    const initialized = initRef<{ value: number }, 'value'>({
      propName: 'value',
      defaultValue: 0,
      initWith: { condition: () => true, fnc: () => 5 },
    })
    expect(initialized.value).toBe(5)
    const callback = () => 1
    const functionRef = initRef<{ value: typeof callback }, 'value'>({ propName: 'value', defaultValue: callback })
    expect(functionRef.value).toBe(callback)
  })

  it('keeps an object read fallback reactive inside a model', async () => {
    let model: Ref<number[] | undefined>
    const wrapper = mount(defineComponent({
      props: { items: Array as PropType<number[]> },
      emits: ['update:items'],
      setup(props) {
        model = initRef({ props, propName: 'items', defaultValue: [] })

        return () => h('span', model.value?.length)
      },
    }))
    try {
      expect(wrapper.text()).toBe('0')
      model!.value!.push(1)
      await nextTick()
      expect(wrapper.text()).toBe('1')
      expect(wrapper.emitted('update:items')).toBeUndefined()
    } finally {
      wrapper.unmount()
    }
  })

  it('preserves the legacy explicit-null-instance shortcut', () => {
    const initialize = vi.fn(() => 9)
    const model = initRef({
      instance: null,
      props: { value: 7 },
      propName: 'value',
      defaultValue: 3,
      initWith: { condition: () => true, fnc: initialize },
    })
    expect(model.value).toBe(3)
    expect(initialize).not.toHaveBeenCalled()
  })
})
