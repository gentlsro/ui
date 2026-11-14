import type { Directive } from 'vue'

/**
 * Plays the ripple as the element's `::after` (`ripple.scss`): no node, attribute, class or inline style of the element
 * changes, so an element clicked before it hydrates still hydrates against the DOM the server rendered
 */
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

  // A click while a ripple plays starts it again from the new point
  // (an element's own list leaves out its pseudo-elements: `subtree` has them, and its descendants' too)
  el.getAnimations({ subtree: true })
    .find(animation => animation.id === 'ripple' && (animation.effect as KeyframeEffect | null)?.target === el)
    ?.cancel()

  // (eased per keyframe interval: the opacity over the first 70 %, the circle over the whole run)
  el.animate([
    { ...box, opacity: 0.3, clipPath: `circle(0.5px at ${at})`, easing: 'ease-out' },
    { ...box, opacity: 0, offset: 0.7, easing: 'ease-out' },
    { ...box, opacity: 0, clipPath: `circle(150px at ${at})` },
  ], { id: 'ripple', pseudoElement: '::after', duration: 800 })
}

/**
 * One listener plays the ripple of every element marked `data-ripple`, started once by the `ripple` plugin: the
 * directive marks the elements it is on, the server renders the mark too, so an element that never hydrates (a
 * published page's static block) ripples as well
 */
export function listenToRipples() {
  document.addEventListener('click', ev => {
    const el = (ev.target as Element | null)?.closest?.('[data-ripple]')

    // Only a visitor's click ripples: a click made by code (DynamicGrid replaying a click made before hydration) would
    // play a second ripple, from the viewport's corner
    if (el && ev.isTrusted) {
      playRipple(el as HTMLElement, ev)
    }

    // Capture phase ~ a `@click.stop` on the element (or between it and the document)
    // would otherwise keep the click from ever reaching this listener
  }, true)
}

function toggleRipple(el: HTMLElement, value: unknown) {
  el.toggleAttribute('data-ripple', value !== false)
}

export const vRipple: Directive = {
  getSSRProps: ({ value }) => value === false ? {} : { 'data-ripple': '' },
  mounted(el, { value }) {
    toggleRipple(el, value)
  },
  updated(el, { value }) {
    toggleRipple(el, value)
  },
}
