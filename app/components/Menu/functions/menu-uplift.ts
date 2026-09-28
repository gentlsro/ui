// Functions
import { useFloatingUIUtils } from '../../../composables/useFloatingUIUtils'

type IMenuUpliftSnapshot = {
  zIndex: string
  backgroundColor: string
}

const menuUpliftSnapshots = new WeakMap<HTMLElement, IMenuUpliftSnapshot>()

export function menuResetUplift(payload: {
  referenceEl?: unknown
}) {
  const el = payload.referenceEl

  if (!(el instanceof HTMLElement)) {
    return
  }

  const snapshot = menuUpliftSnapshots.get(el)

  el.classList.remove('is-menu-active')

  if (!snapshot) {
    return
  }

  el.style.zIndex = snapshot.zIndex
  el.style.backgroundColor = snapshot.backgroundColor
  menuUpliftSnapshots.delete(el)
}

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

  const { getLastFloatingUIZindex } = useFloatingUIUtils()
  zIndex.value = getLastFloatingUIZindex() + 1

  const _referenceEl = referenceEl.value

  if (!(_referenceEl instanceof HTMLElement)) {
    return
  }

  if (!menuUpliftSnapshots.has(_referenceEl)) {
    const referenceElStyle = getComputedStyle(_referenceEl)
    const snapshot: IMenuUpliftSnapshot = {
      zIndex: _referenceEl.style.zIndex,
      backgroundColor: _referenceEl.style.backgroundColor,
    }

    menuUpliftSnapshots.set(_referenceEl, snapshot)
    referenceElZIndex.value = snapshot.zIndex
    isReferenceElTransparent.value = referenceElStyle.backgroundColor === 'rgba(0, 0, 0, 0)'
  }

  _referenceEl.classList.add('is-menu-active')

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
