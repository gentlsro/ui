// @vapor-ready
import type { ObjectDirective, VaporDirective } from 'vue'

function getRippleAttributes(ev: MouseEvent) {
  const target = ev.currentTarget as HTMLElement
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

// Both renderers own the same DOM listener and release unfinished animations.
function bindRipple(el: HTMLElement, isEnabled: () => boolean) {
  const ripples = new Set<HTMLElement>()

  function onClick(ev: MouseEvent) {
    if (!isEnabled() || el.matches(':disabled')) {
      return
    }

    const rippleContainerEl = el.ownerDocument.createElement('span')
    const rippleEl = el.ownerDocument.createElement('span')
    const attributes = getRippleAttributes(ev)

    rippleContainerEl.style.width = attributes.width
    rippleContainerEl.style.height = attributes.height
    rippleContainerEl.style.top = attributes.top || '0'
    rippleContainerEl.style.left = attributes.left || '0'
    rippleEl.style.top = `${attributes.y}px`
    rippleEl.style.left = `${attributes.x}px`
    rippleContainerEl.classList.add('ripple-container')
    rippleEl.classList.add('ripple')
    rippleContainerEl.appendChild(rippleEl)
    ripples.add(rippleContainerEl)

    rippleEl.addEventListener('animationend', () => {
      rippleContainerEl.remove()
      ripples.delete(rippleContainerEl)
    }, { once: true })
    el.appendChild(rippleContainerEl)
  }

  el.addEventListener('click', onClick)

  return () => {
    el.removeEventListener('click', onClick)
    for (const ripple of ripples) {
      ripple.remove()
    }
    ripples.clear()
  }
}

const bindings = new WeakMap<HTMLElement, { enabled: boolean, cleanup: () => void }>()

export const vRipple: ObjectDirective<HTMLElement, boolean | undefined> = {
  mounted(el, { value }) {
    const binding = {
      enabled: value !== false,
      cleanup: () => {},
    }
    binding.cleanup = bindRipple(el, () => binding.enabled)
    bindings.set(el, binding)
  },
  updated(el, { value }) {
    const binding = bindings.get(el)
    if (binding) {
      binding.enabled = value !== false
    }
  },
  beforeUnmount(el) {
    bindings.get(el)?.cleanup()
    bindings.delete(el)
  },
}

// Vapor supplies a live value getter and disposes the returned cleanup with its owner.
export const vRippleVapor: VaporDirective<HTMLElement, boolean | undefined> = (el, value) => {
  return bindRipple(el, () => value?.() !== false)
}
