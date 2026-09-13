// Types
import type { IFieldProps } from '../types/field-props.type'

export function useFieldUtils(options?: {
  props?: IFieldProps
  menuElRef?: MaybeRefOrGetter
  onFocus?: (ev?: PointerEvent | FocusEvent) => void
  onBeforeFocus?: (ev?: PointerEvent | FocusEvent) => { shouldFocus?: boolean, shouldHideFloating?: boolean }
}) {
  const { props, menuElRef, onFocus, onBeforeFocus } = options || {}

  // Store
  const uiStore = useUIStore()

  // Utils
  const instance = getCurrentInstance()

  // Layout
  const el = ref<HTMLDivElement>()
  const inputId = props?.id ?? useId()
  const isBlurred = ref(true)
  const isTouched = ref(false)
  const menuEl = computed(() => toValue(menuElRef))
  let pointerDownTarget: EventTarget | null
  let skipNextControlClick = false
  let isInternalFocus = false

  const inputElement = computed(() => {
    return unrefElement(el) as HTMLElement | undefined
  })

  const controlElement = computed(() => {
    return inputElement.value?.closest('.control') as HTMLElement | undefined
      ?? inputElement.value
  })

  const label = computed(() => {
    if (typeof props?.label === 'function') {
      return props?.label()
    }

    return props?.label
  })

  const isEditable = computed(() => {
    return !props?.readonly && !props?.disabled
  })

  const hasClearableBtn = computed(() => {
    return (
      !props?.readonly && !props?.disabled && props?.clearable
    )
  })

  // In some cases, we click into the wrapper but not directly in the `.control`
  // element, so the `focus` does not get triggered. We need to handle this case manually
  function handlePointerDown(ev: PointerEvent) {
    const target = ev.target as HTMLElement

    pointerDownTarget = target
    skipNextControlClick = !menuEl.value?.isOpen
      && !!controlElement.value?.contains(target)
      && document.activeElement !== controlElement.value
  }

  function handleClickWrapper(ev: MouseEvent) {
    const target = ev.target as HTMLElement
    const isFocusable = target.classList.contains('input-wrapper__focusable')
      || !!target.closest('.input-wrapper__focusable')
    const isInitialControlClick = skipNextControlClick
      && pointerDownTarget === target

    pointerDownTarget = null
    skipNextControlClick = false

    if (isInitialControlClick) {
      return
    }

    if (menuEl.value?.isOpen) {
      menuEl.value.hide()
    } else if (isFocusable) {
      handleFocusOrClick(ev)
    }
  }

  // Click & focus handling
  function handleFocusOrClick(ev?: Event) {
    if (uiStore.hasUserLeftPage || isInternalFocus) {
      return
    }

    const isSelectEvent = ev?.type === 'select'
    const isFocusEvent = ev instanceof FocusEvent
    const {
      shouldFocus = true,
      shouldHideFloating = !props?.noHideFloating,
    } = onBeforeFocus?.(ev as PointerEvent | FocusEvent) ?? {}

    if (isEditable.value) {
      if (shouldHideFloating && (isFocusEvent || isSelectEvent)) {
        const inputMenu = inputElement.value?.closest('.floating-element')

        $hide({
          all: true,
          ignoreUntilEl: props?.hideUntilEl ?? inputMenu,
        })
      }

      if (!shouldFocus) {
        return
      }

      nextTick(() => {
        onFocus?.(ev as PointerEvent | FocusEvent)
      })
    }

    isInternalFocus = true
    el.value?.focus?.()
    isInternalFocus = false
    retainIosKeyboardFocus()

    isTouched.value = isEditable.value
    isBlurred.value = false

    instance?.emit('focus')
  }

  function handleBlur(ev: FocusEvent) {
    isBlurred.value = true
    instance?.emit('blur', ev)
  }

  function getFieldProps(props: IFieldProps) {
    return reactivePick(props, [
      'cursor',
      'disabled',
      'errorTakesSpace',
      'errorVisible',
      'hasContent',
      'hint',
      'label',
      'layout',
      'loading',
      'name',
      'noBorder',
      'noContent',
      'placeholder',
      'readonly',
      'required',
      'size',
      'stackLabel',
      'validation',
      'validationPath',
      'ui',
    ])
  }

  provide('inputId', inputId)

  return {
    el,
    inputId,
    isEditable,
    hasClearableBtn,
    label,
    isTouched,
    isBlurred,
    getFieldProps,
    handleClickWrapper,
    handlePointerDown,
    handleFocusOrClick,
    handleBlur,
  }
}
