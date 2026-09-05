import type { CSSProperties } from 'vue'
import type { ITooltipProps } from '../types/tooltip-props.type'

type TooltipOwner = {
  target: Readonly<Ref<Element | undefined>>
  props: Readonly<Ref<ITooltipProps>>
  attrs: Readonly<Ref<Record<string, unknown>>>
  appearance: Readonly<Ref<{
    containerClass: unknown
    containerStyle: CSSProperties | undefined
    arrowClass: unknown
    arrowStyle: CSSProperties | undefined
  }>>
  setModel: (value: boolean) => void
}

export function createTooltipHost() {
  const active = shallowRef<TooltipOwner>()
  const contentTarget = shallowRef<HTMLElement>()

  let pending: TooltipOwner | undefined
  let timer: ReturnType<typeof setTimeout> | undefined

  function cancel() {
    clearTimeout(timer)
    timer = undefined
    pending = undefined
  }

  function show(owner: TooltipOwner) {
    cancel()

    if (!owner.target.value) {
      return
    }

    const previous = active.value
    active.value = owner

    if (previous && previous !== owner) {
      previous.setModel(false)
    }

    owner.setModel(true)
  }

  function cancelPending(owner: TooltipOwner) {
    if (pending === owner) {
      cancel()
    }
  }

  function release(owner: TooltipOwner) {
    cancelPending(owner)

    if (active.value === owner) {
      active.value = undefined
      owner.setModel(false)
    }
  }

  function enter(owner: TooltipOwner) {
    // Once visible, transfer ownership without unmounting the bubble or waiting
    // for another opening delay. Old leave timers cannot dismiss the new owner.
    if (active.value) {
      show(owner)

      return
    }

    cancel()
    pending = owner
    timer = setTimeout(show, owner.props.value.delay?.[0] ?? 0, owner)
  }

  function leave(owner: TooltipOwner) {
    if (pending === owner) {
      cancel()
    }

    if (active.value !== owner) {
      return
    }

    pending = owner
    timer = setTimeout(release, owner.props.value.delay?.[1] ?? 0, owner)
  }

  function dispose() {
    cancel()

    if (active.value) {
      release(active.value)
    }

    contentTarget.value = undefined
  }

  return {
    active,
    contentTarget,
    show,
    release,
    enter,
    leave,
    cancelPending,
    dispose,
  }
}

export const tooltipHostKey: InjectionKey<ReturnType<typeof createTooltipHost>> = Symbol('tooltip-host')

export function useTooltipHost() {
  const host = inject(tooltipHostKey)

  if (!host) {
    throw new Error(
      'Tooltip requires the UI tooltip-host plugin and one TooltipHost at the application root.',
    )
  }

  return host
}
