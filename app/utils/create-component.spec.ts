// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, h } from 'vue'
import type { FunctionalComponent } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createComponent } from './create-component'

describe('functional component descriptors', () => {
  it('passes props when Vue renders a callable component', async () => {
    const component: FunctionalComponent<{ label: string }> = props => h('span', props.label)
    const descriptor = createComponent({ component, props: { label: 'Invoice' } })
    expect(descriptor.component).toBe(component)
    await expect(renderToString(createSSRApp({ render: () => h(descriptor.component, descriptor.props) })))
      .resolves
      .toBe('<span>Invoice</span>')
  })

  it('distinguishes a zero-argument functional component from a resolver', () => {
    const component = () => h('em', 'Amount')
    const factory = vi.fn(() => component)
    expect(createComponent({ component, functional: true }).component).toBe(component)
    expect(createComponent({ component: factory })?.component).toBe(component)
    expect(factory).toHaveBeenCalledOnce()
  })
})
