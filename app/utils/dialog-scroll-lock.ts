let lockCount = 0
let startY = 0
let startScrollTop = 0
let scrollEl: HTMLElement | null = null

function isIos() {
  return /iP(?:ad|hone|od)/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function findDialogScroller(target: EventTarget | null) {
  let el = target instanceof HTMLElement ? target : null

  while (el) {
    if (el.closest('.dialog')) {
      const { overflowY } = getComputedStyle(el)
      const canScroll = (overflowY === 'auto' || overflowY === 'scroll')
        && el.scrollHeight > el.clientHeight

      if (canScroll) {
        return el
      }
    }

    el = el.parentElement
  }

  return null
}

function onTouchStart(ev: TouchEvent) {
  scrollEl = findDialogScroller(ev.target)
  startY = ev.touches[0]?.clientY ?? 0
  startScrollTop = scrollEl?.scrollTop ?? 0
}

function isTextInputFocused() {
  const el = document.activeElement

  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
}

function onTouchMove(ev: TouchEvent) {
  if (!scrollEl) {
    ev.preventDefault()

    return
  }

  const currentY = ev.touches[0]?.clientY ?? startY
  const deltaY = currentY - startY
  const atTop = scrollEl.scrollTop <= 0
  const atBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 1
  const preventAtEdge = (deltaY > 0 && atTop) || (deltaY < 0 && atBottom)
  const inputFocused = isTextInputFocused()

  // A focused field makes iOS pan the visual viewport instead of overflow.
  // Only hijack in that case so TimeInput wheels keep native momentum.
  if (inputFocused) {
    ev.preventDefault()
    scrollEl.scrollTop = startScrollTop + (startY - currentY)
  } else if (preventAtEdge) {
    ev.preventDefault()
  }
}

function onTouchEnd() {
  scrollEl = null
}

function addIosTouchLock() {
  if (!isIos()) {
    return
  }

  document.addEventListener('touchstart', onTouchStart, { capture: true, passive: true })
  document.addEventListener('touchmove', onTouchMove, { capture: true, passive: false })
  document.addEventListener('touchend', onTouchEnd, { capture: true, passive: true })
}

function removeIosTouchLock() {
  document.removeEventListener('touchstart', onTouchStart, true)
  document.removeEventListener('touchmove', onTouchMove, true)
  document.removeEventListener('touchend', onTouchEnd, true)
  scrollEl = null
}

export function lockDialogBackgroundScroll() {
  if (!import.meta.client) {
    return
  }

  lockCount++

  if (lockCount === 1) {
    document.documentElement.classList.add('is-dialog-open')
    addIosTouchLock()
  }
}

export function unlockDialogBackgroundScroll() {
  if (!import.meta.client) {
    return
  }

  lockCount = Math.max(0, lockCount - 1)

  if (lockCount === 0) {
    document.documentElement.classList.remove('is-dialog-open')
    removeIosTouchLock()
  }
}
