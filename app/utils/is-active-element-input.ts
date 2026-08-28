export function isActiveElementInput(element = document.activeElement) {
  return !!(
    element?.tagName === 'INPUT'
    || element?.tagName === 'TEXTAREA'
    || (element instanceof HTMLElement && element.contentEditable !== 'inherit')
    || element?.getAttribute('role') === 'textbox'
  )
}
