import { useIMask } from 'vue-imask'
import { createMask } from 'imask'

// Types
import type { IInputUtilsOptions } from '../types/input-utils-options.type'

// Functions
import { useInputWrapperUtils } from './useInputWrapperUtils'

export function useInputUtils(options: IInputUtilsOptions) {
  const {
    props,
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
  const instance = getCurrentInstance()
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

  const { el, mask, masked, unmasked, typed } = useIMask(maskRef, {
    onAccept: ev => {
      nextTick(() => {
        const val = maskEventHandlers?.onAccept?.(
          lastValidValue.value,
          ev,
          { typed, unmasked, masked },
        )

        if (!isNil(val)) {
          typed.value = val
        }

        syncTypedWithModel()
      })
    },
    onComplete: ev => {
      nextTick(() => maskEventHandlers?.onCompleted?.(lastValidValue.value, ev))
    },
  })

  const originalModel = useVModel(props, 'modelValue', undefined, { defaultValue: props.emptyValue })
  const model = ref(originalModel.value)

  // We also need to create an instance of mask to get the `masked` value
  // because `useIMask` initializes values in `onMounted` which would break SSR
  const temporaryMask = createMask(toValue(maskRef.value))
  temporaryMask.typedValue = model.value

  // Init the values
  const isModelEmpty = isNil(model.value) || model.value === props.emptyValue

  if (!isModelEmpty) {
    masked.value = temporaryMask.value
    typed.value = temporaryMask.typedValue
    unmasked.value = temporaryMask.unmaskedValue
  }

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

  const inputElement = computed(() => {
    return unrefElement(el.value as any) as HTMLInputElement | undefined
  })

  const hasContent = computed(() => {
    return props.hasContent || !isEmpty.value || !!props.placeholder
  })

  const hasClearableBtn = computed(() => {
    return !props.readonly
      && !props.disabled
      && props.clearable
      && hasContent.value
  })

  // Input methods
  const getInputElement = () => inputElement.value
  const select = () => inputElement.value?.select()

  const focus = (alignCursor?: boolean, preventScroll?: boolean) => {
    inputElement.value?.focus({ preventScroll })

    if (alignCursor === true) {
      mask.value?.alignCursorFriendly()
    }
  }

  const blur = () => {
    isBlurred.value = true
    inputElement.value?.blur()
  }

  const clear = (shouldFocusAfterClear?: boolean) => {
    // typed.value = ''
    masked.value = ''

    if (shouldFocusAfterClear || !isBlurred.value) {
      setTimeout(() => focus(), 0)
    }

    setTimeout(() => {
      instance?.emit('clear')
    }, 0)
  }

  function handleBlur(ev: FocusEvent) {
    const relatedTarget = ev.relatedTarget as HTMLElement
    const lastTarget = uiStore.lastPointerDownEl
    const isProgrammatic = uiStore.activeElement === document.body

    const isFocusable = lastTarget?.classList.contains('input-wrapper__focusable')
      || !!lastTarget?.closest('.input-wrapper__focusable')

    const isSameWrapper = inputElement.value?.closest('.wrapper__body') === lastTarget?.closest('.wrapper__body')

    // `Tab` handling
    const relatedTargetWrapper = relatedTarget?.closest('.wrapper__body')
    const isRelatedTargetFocusable = !relatedTargetWrapper
      || relatedTargetWrapper === inputElement.value?.closest('.wrapper__body')

    // We prevent the blur event when clicking on focusable elements
    // in the same wrapper
    if (
      isFocusable
      && isSameWrapper
      && isRelatedTargetFocusable
      && !isProgrammatic
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
        unmasked.value = ''
      } else {
        model.value = lastValidValue.value
      }
    }

    onBlur?.()
    blur()

    if (props.emitOnBlur) {
      originalModel.value = model.value
    }

    instance?.emit('blur', ev)
  }

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
    const isTouchEvent = uiStore.lastPointerDownEvent?.pointerType !== 'mouse'
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

    instance?.emit('focus')
    onFocus?.(isTouchEvent ? 'touch' : 'mouse', ev)
  }

  // Autofocus on init
  setTimeout(() => {
    if (props.autofocus) {
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

  // We sync the `model` with the `typed` value from iMask
  watch(model, val => {
    const isEmptyValue = isEqual(val, props.emptyValue)
    const isSame = isEqual(val, typed.value) || (typed.value === '' && isEmptyValue)

    if (!isSame) {
      if (isEmptyValue) {
        // typed.value = props.emptyValue
        // masked.value = ''
        unmasked.value = ''
      } else {
        typed.value = val
      }
    }
  })

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
    model,
    masked,
    typed,
    unmasked,
    hasNoValue: isEmpty,
    lastValidValue,

    handleBlur,
    clear,
    focus,
    select,
    blur,
    getInputElement,
    handleFocusOrClick,
    handleClickWrapper,
  }
}
