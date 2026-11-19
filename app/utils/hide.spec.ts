// @vitest-environment happy-dom
import { expect, it, vi } from 'vitest'
import { createApp, getCurrentInstance, h } from 'vue'
import type { ComponentInternalInstance } from 'vue'
import { $hide } from './hide'

it('closes the VDOM owner of a fragment and gives an explicit target precedence', () => {
  const owner = Object.assign(document.createElement('div'), { className: 'floating-element', hide: vi.fn() })
  const sibling = Object.assign(document.createElement('div'), { className: 'floating-element', hide: vi.fn() })
  document.body.append(owner, sibling)
  let instance: ComponentInternalInstance | null = null
  const app = createApp({
    setup() {
      instance = getCurrentInstance()

      return () => [h('span'), h('span')]
    },
  })
  app.mount(owner)
  try {
    $hide({ instance, force: true })
    expect(owner.hide).toHaveBeenCalledWith(true)
    $hide({ instance, target: sibling })
    expect(sibling.hide).toHaveBeenCalledOnce()
    $hide({ instance: null })
    $hide({ target: null, instance })
    expect(owner.hide).toHaveBeenCalledOnce()
    expect(sibling.hide).toHaveBeenCalledOnce()
  } finally {
    app.unmount()
    owner.remove()
    sibling.remove()
  }
})
