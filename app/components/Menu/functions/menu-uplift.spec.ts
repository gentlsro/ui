// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { menuResetUplift, menuUplift } from './menu-uplift'

vi.mock('../../../composables/useFloatingUIUtils', () => ({
  useFloatingUIUtils: () => ({
    getLastFloatingUIZindex: () => 2999,
  }),
}))

const createdEls: HTMLElement[] = []

function createReferenceEl() {
  const el = document.createElement('div')
  document.body.append(el)
  createdEls.push(el)

  return el
}

function uplift(referenceEl: HTMLElement) {
  const zIndex = ref(0)
  const referenceElZIndex = ref<string>()
  const isReferenceElTransparent = ref(false)

  menuUplift({
    zIndex,
    referenceElZIndex,
    isReferenceElTransparent,
    referenceEl: ref(referenceEl),
    color: ref('light'),
  })

  return { zIndex, referenceElZIndex, isReferenceElTransparent }
}

afterEach(() => {
  createdEls.splice(0).forEach(el => el.remove())
})

describe('menuUplift', () => {
  it('keeps the original snapshot when uplift runs again on the same element', () => {
    const referenceEl = createReferenceEl()
    const zIndex = ref(0)
    const referenceElZIndex = ref<string>()
    const isReferenceElTransparent = ref(false)
    const referenceElRef = ref(referenceEl)

    const apply = () => menuUplift({
      zIndex,
      referenceElZIndex,
      isReferenceElTransparent,
      referenceEl: referenceElRef,
      color: ref('light'),
    })

    apply()
    expect(referenceEl.style.zIndex).toBe('3001')
    expect(referenceElZIndex.value).toBe('')

    apply()
    expect(referenceEl.style.zIndex).toBe('3001')
    expect(referenceElZIndex.value).toBe('')

    menuResetUplift({ referenceEl })

    expect(referenceEl.style.zIndex).toBe('')
    expect(referenceEl.classList.contains('is-menu-active')).toBe(false)
  })

  it('restores each element from its own snapshot when the reference changes', () => {
    const previousEl = createReferenceEl()
    const nextEl = createReferenceEl()

    uplift(previousEl)
    uplift(nextEl)

    menuResetUplift({ referenceEl: previousEl })

    expect(previousEl.style.zIndex).toBe('')
    expect(nextEl.style.zIndex).toBe('3001')
  })
})
