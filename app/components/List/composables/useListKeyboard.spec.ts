import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, provide, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { formSubmitKey } from '../../Form/provide/form.provide'
import { useListKeyboard } from './useListKeyboard'

vi.mock('../stores/list.store', () => ({
  useListStore: () => ({
    listEl: ref({ scrollToTop: vi.fn(), scrollToBottom: vi.fn() }),
    containerEl: ref(),
    listItems: ref([{ id: 1 }, { id: 2 }]),
    itemFocused: ref(),
    itemFocusedIdx: ref(-1),
    isFocusedWithin: ref(true),
    handleSelect: vi.fn(),
  }),
}))

describe('list submit keyboard paths', () => {
  it.each([true, false])('submits once with registerKeyStroke=%s even without a focused item', registerKeyStroke => {
    const submit = vi.fn()
    const formSubmit = vi.fn()
    let handleKey: ReturnType<typeof useListKeyboard>['handleKey']
    const child = defineComponent({
      setup() {
        handleKey = useListKeyboard({ onSubmit: submit, registerKeyStroke }).handleKey

        return () => h('div')
      },
    })
    const owner = mount(defineComponent({
      setup() {
        provide(formSubmitKey, formSubmit)

        return () => h(child)
      },
    }))
    try {
      for (const modifier of ['ctrlKey', 'metaKey']) {
        const event = new KeyboardEvent('keydown', { key: 'Enter', [modifier]: true, cancelable: true })
        if (registerKeyStroke) {
          window.dispatchEvent(event)
        } else {
          handleKey!(event, { force: true })
        }
        expect(event.defaultPrevented).toBe(true)
      }
      expect(submit).toHaveBeenCalledTimes(2)
      expect(formSubmit).toHaveBeenCalledTimes(2)
    } finally {
      owner.unmount()
    }
  })
})
