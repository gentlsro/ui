// Types
import type { IInputUtilsOptions } from '../types/input-utils-options.type'

// Functions
import { useInputWrapperUtils } from './useInputWrapperUtils'
import { useInputMask } from './useInputMask'

export function useInputUtils(options: IInputUtilsOptions) {
  const {
    props,
    emit,
    maskRef,
    eventHandlers = {},
    maskEventHandlers,
    menuElRef,
    preventFocusOnTouch,
  } = options

  // Utils
  const isInitialized = ref(false)
  const { getInputWrapperProps } = useInputWrapperUtils()

  const uiStore = useUIStore()
  const { onBlur, onFocus } = eventHandlers
  const isTouched = ref(false)

  const debouncedChange = useDebounceFn((val: any) => {
    if (!props.emitOnBlur) {
      const isSame = isEqual(val, originalModel.value)

      if (!isSame) {
        originalModel.value = val
      }
    }
  }, props.debounce ?? 0)

  // Mask
  const lastValidValue = ref<any>()
  const { emptyValue } = toRefs(props)

  const originalModel = initRef({ props, propName: 'modelValue', defaultValue: props.emptyValue })
  // Keep the editable draft separate until debounce/blur commits it to the owner.
  const model = ref(originalModel.value)

  const { el, mask, masked, unmasked, typed, setTypedValue, clear: clearMask } = useInputMask(maskRef, {
    initialValue: model.value,
    getReformatValue: options.preserveValueOnMaskChange
      ? () => {
          if (isInitialized.value && mask.value?.masked.isComplete === false) {
            model.value = lastValidValue.value
          }

          return model.value
        }
      : undefined,
    isEmptyValue: value => isNil(value) || isEqual(value, props.emptyValue),
    onAccept: ev => {
      nextTick(() => {
        const val = maskEventHandlers?.onAccept?.(
          lastValidValue.value,
          ev,
          { typed, unmasked, masked },
        )

        if (!isNil(val)) {
          setTypedValue(val)
        }

        syncTypedWithModel()
      })
    },
    onComplete: ev => {
      nextTick(() => maskEventHandlers?.onCompleted?.(lastValidValue.value, ev))
    },
  })

  const isEmpty = computed(() => {
    return (
      typed.value === unref(emptyValue)
      || isNil(typed.value)
      || unmasked.value === ''
    )
  })

  // Wrapper
  const wrapperProps = getInputWrapperProps(props)

  // Layout
  const inputId = props.id ?? useId()
  const isBlurred = ref(true)

  const menuEl = computed(() => toValue(menuElRef))

  const label = computed(() => {
    if (typeof props.label === 'function') {
      return props.label()
    }

    return props.label
  })

  const inputElement = el

  const hasContent = computed(() => {
    return props.hasContent || !isEmpty.value || !!props.placeholder
  })

  const hasClearableBtn = computed(() => {
    return !props.readonly
      && !props.disabled
      && props.clearable
      && (props.hasContent || !isEmpty.value)
  })

  // Input methods
  const getInputElement = () => inputElement.value
  const select = () => inputElement.value?.select()

  const focus = (alignCursor?: boolean, preventScroll?: boolean) => {
    const activeBefore = document.activeElement

    inputElement.value?.focus({ preventScroll })

    if (isIosKeyboardFocusHolder(activeBefore)) {
      releaseIosKeyboardFocus()
    }

    if (alignCursor === true) {
      mask.value?.alignCursorFriendly()
    }
  }

  const blur = () => {
    isBlurred.value = true
    inputElement.value?.blur()
  }

  const clear = (shouldFocusAfterClear?: boolean) => {
    model.value = props.emptyValue
    originalModel.value = props.emptyValue

    const restoreFocus = shouldFocusAfterClear
      ?? (!isBlurred.value && !(preventFocusOnTouch && isTouchInteraction()))

    if (restoreFocus) {
      setTimeout(focus, 0)
    }

    setTimeout(() => {
      emit('clear')
    }, 0)
  }

  function handleBlur(ev: FocusEvent) {
    const relatedTarget = ev.relatedTarget as HTMLElement
    const lastTarget = uiStore.lastPointerDownEl
    const isProgrammatic = uiStore.activeElement === document.body

    const isFocusable = lastTarget?.classList.contains('input-wrapper__focusable')
      || !!lastTarget?.closest('.input-wrapper__focusable')

    const isSameWrapper = inputElement.value?.closest('.wrapper__body') === lastTarget?.closest('.wrapper__body')
    const relatedTargetWrapper = relatedTarget?.closest('.wrapper__body')
    const inputWrapper = inputElement.value?.closest('.wrapper__body')
    const isRelatedTargetFocusable = !relatedTarget
      || relatedTargetWrapper === inputWrapper

    // We prevent the blur event when clicking on focusable elements
    // in the same wrapper
    if (
      isFocusable
      && isSameWrapper
      && isRelatedTargetFocusable
      && !isProgrammatic
      && !(preventFocusOnTouch && isTouchInteraction())
    ) {
      ev.preventDefault()
      focus()

      return
    }

    isBlurred.value = true

    // Reset the `model` to its `lastValidValue` if it differs
    const isSame = isEqual(model.value, lastValidValue.value)

    if (!isSame) {
      // We need to reset the iMask placeholder
      const isModelEmpty = isNil(originalModel.value)
        || toValue(originalModel) === toValue(emptyValue)

      if (isModelEmpty) {
        clearMask()
      } else {
        model.value = lastValidValue.value
      }
    }

    onBlur?.()
    blur()

    if (props.emitOnBlur) {
      originalModel.value = model.value
    }

    emit('blur', ev)
  }

  // In some cases, we click into the wrapper but not directly in the `.control`
  // element, so the `focus` does not get triggered. We need to handle this case manually
  function handleClickWrapper(ev: MouseEvent) {
    const target = ev.target as HTMLElement
    const isFocusable = !!target.closest('.input-wrapper__focusable')
    const isTouchLabel = preventFocusOnTouch
      && isTouchPointer(ev)
      && target.closest('label')?.control === inputElement.value

    // A label's default click action focuses its associated input separately
    // from mousedown. Handle this field's label without forwarding that focus.
    if (isTouchLabel) {
      ev.preventDefault()
    }

    if (isFocusable || isTouchLabel) {
      handleFocusOrClick(ev)
    }
  }

  function isTouchPointer(ev?: Event) {
    // WebKit can report pointerType="mouse" for a touch-generated click.
    // Use the preceding pointerdown, but never classify focus or keyboard
    // activation (detail=0) from that potentially stale pointer history.
    return ev instanceof MouseEvent && ev.detail > 0 && isTouchInteraction()
  }

  function isTouchInteraction() {
    const { lastPointerDownType, lastPointerDownEvent, lastKeydownEvent } = uiStore
    const isTouch = lastPointerDownType === 'touch' || lastPointerDownType === 'pen'
    const isKeyboardNewer = lastKeydownEvent
      && lastKeydownEvent.timeStamp > (lastPointerDownEvent?.timeStamp ?? 0)

    return isTouch && !isKeyboardNewer
  }

  // Cancel only the default mouse focus, preserving click in WebKit too.
  // Opening on click also lets the browser distinguish a tap from a scroll.
  function handleMouseDown(ev: MouseEvent) {
    if (preventFocusOnTouch && isTouchPointer(ev)) {
      ev.preventDefault()
    }
  }

  // Click & focus handling
  function handleFocusOrClick(ev?: Event) {
    if (uiStore.hasUserLeftPage) {
      return
    }

    const isSelectEvent = ev?.type === 'select'
    const isFocusEvent = ev instanceof FocusEvent

    if (!props.disabled && !props.readonly) {
      const shouldHideFloating = !props.noHideFloating

      if (shouldHideFloating && (isFocusEvent || isSelectEvent)) {
        const inputMenu = inputElement.value?.closest('.floating-element')

        $hide({ all: true, ignoreUntilEl: props.hideUntilEl ?? inputMenu })
      }

      nextTick(() => {
        menuEl.value?.show()
      })
    }

    // In some cases, for example `DateInput`, we don't want to focus the input
    // on mobile phones
    const isTouchEvent = isTouchPointer(ev)
    const isFocusPrevented = preventFocusOnTouch && isTouchEvent

    // When event is not a `FocusEvent`, we focus it and align the cursor
    const isInputFocused = uiStore.activeElement === inputElement.value

    // We need to manually focus the input when necessary, ie. when the event
    // would not focus the input automatically
    if (
      !isFocusEvent
      && !isSelectEvent
      && !isInputFocused
      && !isFocusPrevented
    ) {
      focus(true)
    }

    if (isFocusPrevented) {
      return
    }

    isBlurred.value = false
    isTouched.value = !props.disabled && !props.readonly

    emit('focus')
    onFocus?.(isTouchEvent ? 'touch' : 'mouse', ev)
  }

  // Autofocus on init
  setTimeout(() => {
    if (props.autofocus && import.meta.client) {
      focus(undefined, true)
    }
  }, props.autofocusTimeout ?? 0)

  function syncTypedWithModel() {
    if (!isInitialized.value) {
      return
    }

    const value = isEmpty.value ? props.emptyValue : typed.value

    // We only emit the value when the mask is complete
    // or if we allow incomplete mask values
    // or if we removed the value (ie. isEmpty === true)
    const isComplete = mask.value?.masked.isComplete

    if (isComplete || props.allowIncompleteMaskValue || isEmpty.value) {
      lastValidValue.value = value
      debouncedChange(value)
    }

    model.value = value
  }

  // IMask handles equality, formatting, and empty numeric values.
  watch(model, setTypedValue)

  // We also need to sync the `model` when the `originalModel` changes
  watch(originalModel, val => {
    model.value = val
  })

  // Initialize
  onMounted(() => {
    nextTick(() => {
      isInitialized.value = true
      lastValidValue.value = model.value
    })
  })

  provide('inputId', inputId)

  return {
    // Mask
    elMask: mask,

    // Layout
    el,
    label,
    inputId,
    isBlurred,
    hasContent,
    wrapperProps,
    isTouched,
    hasClearableBtn,

    // State
    originalModel,
    model,
    masked,
    typed,
    unmasked,
    hasNoValue: isEmpty,
    lastValidValue,
    setTypedValue,

    handleBlur,
    clear,
    focus,
    select,
    blur,
    getInputElement,
    handleFocusOrClick,
    handleMouseDown,
    handleClickWrapper,
  }
}
