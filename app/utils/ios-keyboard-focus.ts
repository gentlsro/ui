const HOLDER_ID = 'ios-keyboard-focus-holder'

function isIos() {
  return /iP(?:ad|hone|od)/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function getHolder() {
  return document.getElementById(HOLDER_ID) as HTMLInputElement | null
}

/**
 * iOS only shows the software keyboard when `focus()` happens in the same
 * user-gesture turn. Autofocus often runs later (mount + setTimeout), so we
 * park focus on a hidden input during the tap and transfer it afterward.
 */
export function retainIosKeyboardFocus() {
  if (!import.meta.client || !isIos()) {
    return
  }

  let holder = getHolder()

  if (!holder) {
    holder = document.createElement('input')
    holder.id = HOLDER_ID
    holder.type = 'text'
    holder.tabIndex = -1
    holder.autocomplete = 'off'
    holder.setAttribute('aria-hidden', 'true')
    holder.style.cssText = 'position:fixed;left:0;top:0;opacity:0;height:0;width:0;font-size:16px;border:0;padding:0;pointer-events:none;'
    document.body.appendChild(holder)
  }

  holder.focus()
}

export function releaseIosKeyboardFocus() {
  getHolder()?.remove()
}

export function isIosKeyboardFocusHolder(el?: Element | null) {
  return el?.id === HOLDER_ID
}
