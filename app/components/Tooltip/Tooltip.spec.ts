import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, vaporInteropPlugin } from 'vue'
import type { App } from 'vue'

import Tooltip from './Tooltip.vue'
import TooltipHost from './TooltipHost.vue'
import { createTooltipHost, tooltipHostKey } from './composables/useTooltipHost'

const Fixture = defineComponent({
  props: {
    mode: {
      type: String as () => 'hover' | 'click',
      default: 'hover',
    },
  },
  components: { Tooltip, TooltipHost },
  template: `
    <div>
      <TooltipHost />
      <button type="button">
        Action
        <Tooltip :content="{ title: 'Help' }" :mode />
      </button>
    </div>
  `,
})

const tooltipHostPlugin = {
  install(app: App) {
    app.provide(tooltipHostKey, createTooltipHost())
  },
}

const mountOptions = {
  attachTo: document.body,
  global: { plugins: [vaporInteropPlugin, tooltipHostPlugin] },
}

describe('tooltip', () => {
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('keeps a hover tooltip open through a pointer click and closes on pointer leave', async () => {
    const wrapper = mount(Fixture, mountOptions)
    const button = wrapper.get('button')

    await nextTick()
    await nextTick()

    await button.trigger('mouseenter')
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()

    await button.trigger('pointerdown')
    await button.trigger('focus')
    await button.trigger('pointerup')
    await button.trigger('click', { detail: 1 })
    await nextTick()

    expect(document.body.querySelector('[role="tooltip"]')).not.toBeNull()

    await button.trigger('mouseleave')
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    wrapper.unmount()
  })

  it('toggles a click tooltip on pointer clicks', async () => {
    const wrapper = mount(Fixture, {
      ...mountOptions,
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
      ...mountOptions,
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
