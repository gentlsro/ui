import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'

import Tooltip from './Tooltip.vue'

const Fixture = defineComponent({
  components: { Tooltip },
  props: {
    mode: {
      type: String as () => 'hover' | 'click',
      default: 'hover',
    },
  },
  template: `
    <button type="button">
      Action
      <Tooltip :content="{ title: 'Help' }" :mode />
    </button>
  `,
})

describe('tooltip', () => {
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('keeps a hover tooltip open through a pointer click and closes on pointer leave', async () => {
    vi.useFakeTimers()
    const wrapper = mount(Fixture, { attachTo: document.body })
    const button = wrapper.get('button')

    await nextTick()
    await nextTick()

    await button.trigger('mouseenter')
    await vi.runAllTimersAsync()
    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()

    await button.trigger('pointerdown')
    await button.trigger('focus')
    await button.trigger('pointerup')
    await button.trigger('click', { detail: 1 })
    await nextTick()

    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()

    await button.trigger('mouseleave')
    await vi.runAllTimersAsync()

    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    wrapper.unmount()
  })

  it('toggles a click tooltip on pointer clicks', async () => {
    const wrapper = mount(Fixture, {
      attachTo: document.body,
      props: { mode: 'click' },
    })
    const button = wrapper.get('button')

    await nextTick()
    await nextTick()

    await button.trigger('pointerdown')
    await button.trigger('focus')
    await button.trigger('pointerup')
    await button.trigger('click', { detail: 1 })
    await nextTick()

    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()

    await button.trigger('pointerdown')
    await button.trigger('click', { detail: 1 })
    await nextTick()

    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    wrapper.unmount()
  })

  it('keeps focus and keyboard behavior in click mode', async () => {
    const wrapper = mount(Fixture, {
      attachTo: document.body,
      props: { mode: 'click' },
    })
    const button = wrapper.get('button')

    await nextTick()
    await nextTick()

    await button.trigger('focus')
    await button.trigger('click', { detail: 0 })
    await nextTick()

    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()
    wrapper.unmount()
  })
})
