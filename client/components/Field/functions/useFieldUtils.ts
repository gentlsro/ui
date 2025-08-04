// Types
import type { IFieldProps } from '../types/field-props.type'

export function useFieldUtils(options?: {
  props?: IFieldProps
  onFocus?: (ev?: PointerEvent | FocusEvent) => void
  onBeforeFocus?: (ev?: PointerEvent | FocusEvent) => { shouldFocus?: boolean, shouldHideFloating?: boolean }
}) {
  const { props, onFocus, onBeforeFocus } = options || {}

  // Store
  const uiStore = useUIStore()

  // Utils
  const instance = getCurrentInstance()

  // Layout
  const el = ref<HTMLDivElement>()
  const inputId = props?.id ?? useId()
  const isBlurred = ref(true)

  const inputElement = computed(() => {
    return unrefElement(el) as HTMLElement | undefined
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
  function handleClickWrapper(ev: MouseEvent) {
    const target = ev.target as HTMLElement
    const isFocusable = target.classList.contains('.input-wrapper__focusable')
      || !!target.closest('.input-wrapper__focusable')

    if (isFocusable) {
      handleFocusOrClick(ev)
    }
  }

  // Click & focus handling
  function handleFocusOrClick(ev?: Event) {
    if (uiStore.hasUserLeftPage) {
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

    el.value?.focus?.()
    isBlurred.value = false
    instance?.emit('focus')
  }

  function getFieldProps(props: IFieldProps) {
    return reactivePick(props, [
      'activeLabelColor',
      'cursor',
      'disabled',
      'errorTakesSpace',
      'errorVisible',
      'hasContent',
      'hint',
      'label',
      'layout',
      'loading',
      'noBorder',
      'noContent',
      'placeholder',
      'readonly',
      'required',
      'size',
      'stackLabel',
      'validation',
      'zod',
    ])
  }

  provide('inputId', inputId)

  return {
    el,
    inputId,
    isEditable,
    hasClearableBtn,
    label,
    getFieldProps,
    handleClickWrapper,
    handleFocusOrClick,
  }
}
