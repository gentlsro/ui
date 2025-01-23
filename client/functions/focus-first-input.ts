import { isElementInViewport } from './is-element-in-viewport'

export function focusFirstInput(payload: {
  el?: HTMLElement
  lastPointerDownType?: PointerEvent['pointerType']
}) {
  const { el, lastPointerDownType } = payload
  const { isDesktop } = useDevice()

  // We only focus the first input if the last pointer down type was a mouse
  // because on touch devices, it would most likely open a virtual keyboard
  // which might take unnecessary space on the screen
  const shouldFocus = lastPointerDownType === 'mouse' || (isDesktop && !lastPointerDownType)

  if (shouldFocus) {
    const inputElements = el?.querySelectorAll('.wrapper__body') || []

    const firstEditableField = Array.from(inputElements).find(el => {
      const inputChild = el.querySelector('.control:not([readonly]):not([disabled])') as HTMLElement

      return !!inputChild
    }) as HTMLElement

    const firstEditableInput = firstEditableField?.querySelector('.control:not([readonly]):not([disabled])') as HTMLElement

    if (firstEditableInput) {
      const isInViewPort = isElementInViewport(firstEditableInput)

      if (isInViewPort) {
        firstEditableInput.focus()
      }
    }
  }
}
