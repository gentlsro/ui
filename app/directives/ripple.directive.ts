import { watchEffect } from 'vue'
import type { Directive, VaporDirective } from 'vue'

/**
 * Plays the ripple as the element's `::after` (`ripple.scss`): no node, attribute, class or inline style of the element
 * changes, so an element clicked before it hydrates still hydrates against the DOM the server rendered
 */
const animations = new WeakMap<HTMLElement, Animation>()

function stopRipple(el: HTMLElement) {
  animations.get(el)?.cancel()
  animations.delete(el)
}

function playRipple(el: HTMLElement, ev: MouseEvent) {
  const rect = el.getBoundingClientRect()
  const style = getComputedStyle(el)
  const zoom = Number.parseFloat(style.getPropertyValue('--zoom')) || 1

  // A circle from the click, 0.5px to 150px (a 1px dot scaled 300), over the element's border box, clipped to its outer
  // radius ~ absolute offsets start inside the border
  const at = `${(ev.clientX - rect.left) / zoom + 0.5}px ${(ev.clientY - rect.top) / zoom + 0.5}px`
  const box = {
    top: `-${style.borderTopWidth}`,
    left: `-${style.borderLeftWidth}`,
    width: `${rect.width / zoom}px`,
    height: `${rect.height / zoom}px`,
    borderRadius: style.borderRadius,
    backgroundColor: style.color,
  }

  stopRipple(el)

  // (eased per keyframe interval: the opacity over the first 70 %, the circle over the whole run)
  const animation = el.animate([
    { ...box, opacity: 0.3, clipPath: `circle(0.5px at ${at})`, easing: 'ease-out' },
    { ...box, opacity: 0, offset: 0.7, easing: 'ease-out' },
    { ...box, opacity: 0, clipPath: `circle(150px at ${at})` },
  ], { id: 'ripple', pseudoElement: '::after', duration: 800 })
  animations.set(el, animation)
}

/**
 * One listener plays the ripple of every element marked `data-ripple`, started once by the `ripple` plugin: the
 * directive marks the elements it is on, the server renders the mark too, so an element that never hydrates (a
 * published page's static block) ripples as well
 */
export function listenToRipples() {
  const controller = new AbortController()
  document.addEventListener('click', ev => {
    const target = ev.target as Element | null
    const el = target?.closest?.('[data-ripple], button, a[href]')

    // Only a visitor's click ripples: a click made by code (DynamicGrid replaying a click made before hydration) would
    // play a second ripple, from the viewport's corner
    if (el?.matches('[data-ripple]:not(:disabled)') && ev.isTrusted) {
      playRipple(el as HTMLElement, ev)
    }

    // Capture phase ~ a `@click.stop` on the element (or between it and the document)
    // would otherwise keep the click from ever reaching this listener
  }, { capture: true, signal: controller.signal })

  return () => controller.abort()
}

function toggleRipple(el: HTMLElement, value: unknown) {
  el.toggleAttribute('data-ripple', value !== false)
}

export const vRipple: Directive = {
  beforeUnmount: stopRipple,
  getSSRProps: ({ value }) => value === false ? {} : { 'data-ripple': '' },
  mounted(el, { value }) {
    toggleRipple(el, value)
  },
  updated(el, { value }) {
    toggleRipple(el, value)
  },
}

const bindVaporRipple: VaporDirective<HTMLElement, boolean | undefined> = (el, value) => {
  const stop = watchEffect(() => toggleRipple(el, value?.()))

  return () => {
    stop()
    stopRipple(el)
  }
}

export const vRippleVapor = Object.assign(bindVaporRipple, { getSSRProps: vRipple.getSSRProps })
