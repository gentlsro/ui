import type { Directive } from 'vue'

function getRippleAttributes(target: HTMLElement, ev: MouseEvent) {
  const rect = target.getBoundingClientRect()
  const computedStyle = getComputedStyle(target)
  const borderWidth = computedStyle.getPropertyValue('border-width')
  const zoomValue = computedStyle.getPropertyValue('--zoom')
  const zoom = zoomValue ? Number.parseFloat(zoomValue) : 1

  const x = (ev.clientX - rect.left) / zoom
  const y = (ev.clientY - rect.top) / zoom
  const width = rect.width / zoom
  const height = rect.height / zoom

  return {
    x,
    y,
    width: `${width}px`,
    height: `${height}px`,
    ...(borderWidth && { top: `-${borderWidth}`, left: `-${borderWidth}` }),
  }
}

function playRipple(el: HTMLElement, ev: MouseEvent) {
  const rippleContainerEl = document.createElement('span')
  const rippleEl = document.createElement('span')
  const rippleAttributes = getRippleAttributes(el, ev)

  // Handle bordered elements
  rippleContainerEl.style.width = rippleAttributes.width
  rippleContainerEl.style.height = rippleAttributes.height
  rippleContainerEl.style.top = rippleAttributes.top || '0'
  rippleContainerEl.style.left = rippleAttributes.left || '0'

  rippleEl.style.top = `${rippleAttributes.y}px`
  rippleEl.style.left = `${rippleAttributes.x}px`

  rippleContainerEl.classList.add('ripple-container')
  rippleEl.classList.add('ripple')
  rippleContainerEl.appendChild(rippleEl)

  rippleEl.addEventListener('animationend', () => {
    rippleContainerEl.remove()
  })

  el.appendChild(rippleContainerEl)
}

let isListening = false

/**
 * One listener plays the ripple of every element marked `data-ripple`: the directive marks the elements it is on, the
 * server renders the mark too, so an element that never hydrates (a published page's static block) ripples as well
 */
export function listenToRipples() {
  if (isListening) {
    return
  }

  isListening = true
  document.addEventListener('click', ev => {
    const el = (ev.target as Element | null)?.closest?.('[data-ripple]')

    if (el) {
      playRipple(el as HTMLElement, ev)
    }
  })
}

function toggleRipple(el: HTMLElement, value: unknown) {
  el.toggleAttribute('data-ripple', value !== false)
}

export const vRipple: Directive = {
  getSSRProps: ({ value }) => value === false ? {} : { 'data-ripple': '' },
  mounted(el, { value }) {
    toggleRipple(el, value)
    listenToRipples()
  },
  updated(el, { value }) {
    toggleRipple(el, value)
  },
}
