// @vapor-ready — browser style state is captured only when a gesture starts.

/** Prevent selection during a gesture and restore the previous inline rule. */
export function disableDocumentSelection(target = document.body) {
  const style = target.style
  // WebKit exposes only the prefixed property on supported Safari versions.
  const property = CSS.supports('user-select', 'none') ? 'user-select' : '-webkit-user-select'
  const value = style.getPropertyValue(property)
  const priority = style.getPropertyPriority(property)
  style.setProperty(property, 'none')

  return () => {
    if (value) {
      style.setProperty(property, value, priority)
    } else {
      style.removeProperty(property)
    }
  }
}
