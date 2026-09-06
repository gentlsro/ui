import type { Ref } from 'vue'
import IMask, { createMask, Masked } from 'imask'
import { computed, onScopeDispose, shallowRef, toRaw, watch } from 'vue'
import type { FactoryOpts, InputMask } from 'imask'

type InputMaskOptions = {
  initialValue: any
  isEmptyValue: (value: any) => boolean
  getReformatValue?: () => any
  onAccept?: (event?: InputEvent) => void
  onComplete?: (event?: InputEvent) => void
}

/** @vapor-ready DOM refs and effect scopes own the mask in either renderer. */
export function useInputMask(maskRef: Ref<FactoryOpts>, options: InputMaskOptions) {
  // createMask(existingInstance) returns that instance. Wrap it in options to
  // create an owned copy, including when a caller shares a mask across inputs.
  const maskOptions = computed(() => {
    const source = toRaw(maskRef.value)

    return { mask: createMask(source instanceof Masked ? { mask: source } : source) }
  })

  const binding = {
    el: shallowRef<HTMLInputElement | HTMLTextAreaElement>(),
    mask: shallowRef<InputMask<FactoryOpts>>(),
    masked: shallowRef(''),
    unmasked: shallowRef(''),
    typed: shallowRef<any>(),
  }
  let reformatting = false

  let headless = createMask({ mask: maskOptions.value.mask })

  function publishHeadless() {
    binding.masked.value = headless.value
    binding.unmasked.value = headless.unmaskedValue
    // A numeric empty mask parses as zero; preserve its empty display.
    binding.typed.value = headless.unmaskedValue === '' ? undefined : headless.typedValue
  }

  function clear() {
    setUnmaskedValue('')
  }

  function setTypedValue(value: any) {
    if (options.isEmptyValue(value)) {
      clear()

      return
    }

    const live = binding.mask.value
    if (live) {
      // Bypass ref equality: an empty number mask and a displayed zero both
      // have typedValue 0. IMask's setter understands the distinction.
      live.typedValue = value
    } else {
      headless.typedValue = value
      publishHeadless()
    }
  }

  function setUnmaskedValue(value: string) {
    const live = binding.mask.value
    if (live) {
      live.unmaskedValue = value
    } else {
      headless.unmaskedValue = value
      publishHeadless()
    }
  }

  function setMaskedValue(value: string) {
    const live = binding.mask.value
    if (live) {
      live.value = value
    } else {
      headless.value = value
      publishHeadless()
    }
  }

  setTypedValue(options.initialValue)

  function publishLive() {
    const live = binding.mask.value
    if (!live) {
      return
    }

    binding.masked.value = live.value
    binding.unmasked.value = live.unmaskedValue
    binding.typed.value = live.typedValue
  }

  function destroy() {
    const live = binding.mask.value
    if (!live) {
      return
    }

    // Keep edits while the DOM ref is absent so the same owner can remount.
    headless = createMask({ mask: maskOptions.value.mask })
    headless.value = live.value
    live.destroy()
    binding.mask.value = undefined
    publishHeadless()
  }

  watch(binding.el, element => {
    destroy()
    if (!element) {
      return
    }

    const live = IMask(element, maskOptions.value)
    live.value = binding.masked.value
    binding.mask.value = live
    publishLive()
    live.on('accept', event => {
      publishLive()
      if (!reformatting) {
        options.onAccept?.(event)
      }
    })
    live.on('complete', event => {
      if (!reformatting) {
        options.onComplete?.(event)
      }
    })
  }, { flush: 'post' })
  onScopeDispose(destroy)

  watch(maskOptions, nextOptions => {
    const live = binding.mask.value
    const preserve = !!options.getReformatValue
    const value = preserve ? options.getReformatValue!() : binding.typed.value
    const empty = preserve ? options.isEmptyValue(value) : binding.unmasked.value === ''

    reformatting = preserve
    try {
      if (live) {
        live.updateOptions(nextOptions)
        if (preserve) {
          // Go through the new masked model directly: typed equality can be
          // misleading when the previous digits also form a different date.
          if (empty) {
            live.masked.unmaskedValue = ''
          } else {
            live.masked.typedValue = value
          }
          live.updateControl()
        }

        return
      }

      headless = createMask({ mask: maskOptions.value.mask })
      if (empty) {
        clear()
      } else {
        setTypedValue(value)
      }
    } finally {
      reformatting = false
    }
  })

  return {
    el: binding.el,
    mask: computed(() => binding.mask.value),
    // Writable computed refs preserve the callback API without losing writes
    // of equal typed values. All setters go through the same adapter.
    typed: computed({ get: () => binding.typed.value, set: setTypedValue }),
    masked: computed({ get: () => binding.masked.value, set: setMaskedValue }),
    unmasked: computed({ get: () => binding.unmasked.value, set: setUnmaskedValue }),
    setTypedValue,
    clear,
  }
}
