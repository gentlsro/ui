import type { Ref } from 'vue'
import { useIMask } from 'vue-imask'
import { createMask, Masked } from 'imask'
import { computed, onMounted, shallowRef, toRaw, watch } from 'vue'
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

  // Own option updates so replacement and typed-value restoration happen
  // together, before any application accept/complete handlers can run.
  const bindingOptions = shallowRef({ ...maskOptions.value })
  let reformatting = false
  const binding = useIMask(bindingOptions, {
    onAccept: event => {
      if (!reformatting) {
        options.onAccept?.(event)
      }
    },
    onComplete: event => {
      if (!reformatting) {
        options.onComplete?.(event)
      }
    },
  })

  // vue-imask creates its mask when the element arrives and again, unguarded, on mount. An update that waited for a
  // lazily loaded component runs between the input's ref and the mounted hook (Vue queues it as a post effect) and
  // flushes that watcher: the second mask left the first one bound to the input and wrote the typed value of an
  // empty number mask (0) into the field. vue-imask gets the element once the component has mounted, so only its
  // watcher creates the mask
  const el = shallowRef<typeof binding.el.value>()

  onMounted(() => watch(el, value => binding.el.value = value, { immediate: true, flush: 'sync' }))

  let headless = createMask({ mask: maskOptions.value.mask })

  function getLiveMask() {
    // toRaw removes vue-imask's readonly proxy at runtime, but Vue retains
    // the readonly type. Keep the mutable instance private to this adapter.
    return toRaw(binding.mask.value) as InputMask<FactoryOpts> | undefined
  }

  function publishHeadless() {
    binding.masked.value = headless.value
    binding.unmasked.value = headless.unmaskedValue
    // Leave the typed default unset for empty masks: useIMask applies seeded
    // typed refs on mount, and a numeric empty mask parses as zero.
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

    const live = getLiveMask()
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
    const live = getLiveMask()
    if (live) {
      live.unmaskedValue = value
    } else {
      headless.unmaskedValue = value
      publishHeadless()
    }
  }

  function setMaskedValue(value: string) {
    const live = getLiveMask()
    if (live) {
      live.value = value
    } else {
      headless.value = value
      publishHeadless()
    }
  }

  setTypedValue(options.initialValue)

  watch(maskOptions, nextOptions => {
    const live = getLiveMask()
    const preserve = !!options.getReformatValue
    const value = preserve ? options.getReformatValue!() : binding.typed.value
    const empty = preserve ? options.isEmptyValue(value) : binding.unmasked.value === ''

    // Keep mount/remount options current without scheduling vue-imask's own
    // update watcher. This shallow ref's object is deliberately not reactive.
    bindingOptions.value.mask = nextOptions.mask
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
    el,
    mask: binding.mask,
    // Writable computed refs preserve the callback API without losing writes
    // of equal typed values. All setters go through the same adapter.
    typed: computed({ get: () => binding.typed.value, set: setTypedValue }),
    masked: computed({ get: () => binding.masked.value, set: setMaskedValue }),
    unmasked: computed({ get: () => binding.unmasked.value, set: setUnmaskedValue }),
    setTypedValue,
    clear,
  }
}
