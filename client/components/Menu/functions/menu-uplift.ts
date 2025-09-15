// Functions
import { useFloatingUIUtils } from '../../FloatingUI/functions/useFloatingUIUtils'

const { getLastFloatingUIZindex } = useFloatingUIUtils()

export function menuUplift(payload: {
  zIndex: Ref<number>
  referenceElZIndex: Ref<string | undefined>
  isReferenceElTransparent: Ref<boolean>
  referenceEl: Ref<any>
  color: Ref<string>
  modifiers?: {
    overlay?: boolean
    uplift?: boolean
    cover?: boolean
  }
}) {
  const {
    zIndex,
    referenceElZIndex,
    isReferenceElTransparent,
    referenceEl,
    modifiers,
    color,
  } = payload

  zIndex.value = getLastFloatingUIZindex() + 1

  const _referenceEl = referenceEl.value as HTMLElement

  if (!(_referenceEl instanceof Element)) {
    return
  }

  const referenceElStyle = getComputedStyle(_referenceEl as any)

  _referenceEl.classList.add('is-menu-active')
  referenceElZIndex.value = referenceElStyle.zIndex

  isReferenceElTransparent.value = referenceElStyle.backgroundColor === 'rgba(0, 0, 0, 0)'

  // Uplift the reference element (zIndex)
  const { overlay = true, uplift = true, cover } = modifiers ?? {}
  if (overlay && uplift && !cover) {
    _referenceEl.style.zIndex = `${zIndex.value + 1}`
  }

  if (isReferenceElTransparent.value && uplift && !cover) {
    if (color.value === 'light') {
      _referenceEl.style.backgroundColor = 'white'
    } else {
      _referenceEl.style.backgroundColor = 'black'
    }
  }
}
