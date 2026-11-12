import type { Ref } from 'vue'
import IMask, { createMask, Masked } from 'imask'
import { computed, onScopeDispose, shallowReadonly, shallowRef, toRaw, watch } from 'vue'
import type { FactoryOpts, InputMask } from 'imask'

type InputMaskOptions = {
  initialValue: any
  isEmptyValue: (value: any) => boolean
  getReformatValue?: () => any
  onAccept?: (event?: InputEvent) => void
  onComplete?: (event?: InputEvent) => void
}

/** SSR formatting and programmatic writes share IMask's typed-value semantics. */
export function useInputMask(maskRef: Ref<FactoryOpts>, options: InputMaskOptions) {
  // createMask(existingInstance) returns that instance. Wrap it in options to
  // create an owned copy, including when a caller shares a mask across inputs.
  const maskOptions = computed(() => {
    const source = toRaw(maskRef.value)

    return { mask: createMask(source instanceof Masked ? { mask: source } : source) }
  })

  const el = shallowRef<HTMLInputElement | HTMLTextAreaElement | null>()
  const mask = shallowRef<InputMask<FactoryOpts>>()
  const masked = shallowRef('')
  const unmasked = shallowRef('')
  const typed = shallowRef<any>()
  let reformatting = false
  let headless = createMask({ mask: maskOptions.value.mask })

  function publish(source: { value: string, unmaskedValue: string, typedValue: any }) {
    masked.value = source.value
    unmasked.value = source.unmaskedValue
    typed.value = source.typedValue
  }

  function publishHeadless() {
    publish(headless)
    // An empty numeric mask parses as zero; the field is empty, not zero
    if (headless.unmaskedValue === '') {
      typed.value = undefined
    }
  }

  // The only place a live mask is made or destroyed: one per element, created when the element arrives
  // (synchronously, so the mask exists in mounted hooks) and destroyed when it leaves or the scope ends
  function bind(next?: HTMLInputElement | HTMLTextAreaElement | null) {
    mask.value?.destroy()
    mask.value = undefined

    if (!next) {
      return
    }

    const live = IMask(next, { mask: maskOptions.value.mask })
    // The refs hold what was written while no mask was bound
    live.unmaskedValue = unmasked.value
    live.on('accept', (event?: InputEvent) => {
      publish(live)
      if (!reformatting) {
        options.onAccept?.(event)
      }
    }).on('complete', (event?: InputEvent) => {
      if (!reformatting) {
        options.onComplete?.(event)
      }
    })
    mask.value = live
    publish(live)
  }

  watch(el, bind, { flush: 'sync' })
  onScopeDispose(() => bind(null))

  // vue-imask applied the options once more in the flush after it had created the mask, which makes the mask's
  // model the adapter's own. For a pattern mask that fires `accept` (and `complete`) after the component has mounted,
  // and consumers follow it: a date field writes its normalized value to the model then. Kept, at the same point
  watch(mask, live => live?.updateOptions({ mask: maskOptions.value.mask }), { once: true })

  function clear() {
    setUnmaskedValue('')
  }

  function setTypedValue(value: any) {
    if (options.isEmptyValue(value)) {
      clear()

      return
    }

    if (mask.value) {
      // Bypass ref equality: an empty number mask and a displayed zero both
      // have typedValue 0. IMask's setter understands the distinction.
      mask.value.typedValue = value
    } else {
      headless.typedValue = value
      publishHeadless()
    }
  }

  function setUnmaskedValue(value: string) {
    if (mask.value) {
      mask.value.unmaskedValue = value
    } else {
      headless.unmaskedValue = value
      publishHeadless()
    }
  }

  function setMaskedValue(value: string) {
    if (mask.value) {
      mask.value.value = value
    } else {
      headless.value = value
      publishHeadless()
    }
  }

  setTypedValue(options.initialValue)

  watch(maskOptions, nextOptions => {
    const live = mask.value
    const preserve = !!options.getReformatValue
    const value = preserve ? options.getReformatValue!() : typed.value
    const empty = preserve ? options.isEmptyValue(value) : unmasked.value === ''

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

      headless = createMask({ mask: nextOptions.mask })
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
    el,
    mask: shallowReadonly(mask),
    // Writable computed refs preserve the callback API without losing writes
    // of equal typed values. All setters go through the same adapter.
    typed: computed({ get: () => typed.value, set: setTypedValue }),
    masked: computed({ get: () => masked.value, set: setMaskedValue }),
    unmasked: computed({ get: () => unmasked.value, set: setUnmaskedValue }),
    setTypedValue,
    clear,
  }
}
