import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
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
  global: { plugins: [tooltipHostPlugin] },
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

describe('tooltip host', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders a single bubble shared across many tooltips', async () => {
    const Many = defineComponent({
      components: { Tooltip, TooltipHost },
      template: `
        <div>
          <TooltipHost />
          <button v-for="i in 20" :key="i" type="button" :data-i="i">
            Action {{ i }}
            <Tooltip :content="{ title: 'Help ' + i }" />
          </button>
        </div>
      `,
    })

    const wrapper = mount(Many, mountOptions)
    const buttons = wrapper.findAll('button')

    await nextTick()
    await nextTick()

    expect(document.body.querySelectorAll('[role="tooltip"]')).toHaveLength(0)

    await buttons[0]!.trigger('mouseenter')
    await new Promise(resolve => setTimeout(resolve, 0))
    await buttons[0]!.trigger('mouseleave')
    await buttons[1]!.trigger('mouseenter')
    await nextTick()

    const bubbles = document.body.querySelectorAll('[role="tooltip"]')
    expect(bubbles).toHaveLength(1)
    expect(bubbles[0]!.textContent).toContain('Help 2')
    wrapper.unmount()
  })
})
