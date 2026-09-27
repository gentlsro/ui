// Types
import type { IStepProps } from '../types/step-props.type'
import type { IStepperProps } from '../types/stepper-props.type'

type IStepRegistration = {
  id: number
  props: IStepProps
  el: Ref<HTMLElement | undefined>
}

export type IStepStatus = 'active' | 'completed' | 'error' | 'upcoming'

export type IStepperSlotProps = {
  step: IStepProps
  idx: number
  status: IStepStatus
}

// @vapor-ready
export function useStepperUtils(props: IStepperProps, sourceModel: Ref<string | undefined>) {
  const registrations = shallowRef<IStepRegistration[]>([])
  let nextStepId = 0

  // Without a model, the first declared step is active; it registers first, also during SSR
  const model = computed({
    get: () => sourceModel.value ?? registrations.value[0]?.props.name,
    set: value => sourceModel.value = value,
  })

  const activeIdx = computed(() => {
    return registrations.value.findIndex(step => step.props.name === model.value)
  })

  // In `linear` mode, the user may click on any step up to the furthest one reached. Watchers do not run during SSR,
  // so the active step is part of the computed ~ the server and the client agree on which steps are clickable
  const reachedIdx = ref(-1)
  const furthestIdx = computed(() => Math.max(activeIdx.value, reachedIdx.value))

  watch(activeIdx, idx => {
    reachedIdx.value = Math.max(reachedIdx.value, idx)
  })

  const steps = computed(() => {
    return registrations.value.map((step, idx) => {
      const isActive = idx === activeIdx.value
      const isPassed = activeIdx.value !== -1 && idx < activeIdx.value
      const isDisabled = !!(props.disabled || step.props.disabled)

      let status: IStepStatus = 'upcoming'

      if (step.props.error) {
        status = 'error'
      } else if (isActive) {
        status = 'active'
      } else if (isPassed) {
        status = 'completed'
      }

      return {
        id: step.id,
        props: step.props,
        idx,
        status,
        isActive,
        isPassed,
        isDisabled,
        isSelectable: !isDisabled && (!props.linear || idx <= furthestIdx.value),
        isFirst: idx === 0,
        isLast: idx === registrations.value.length - 1,
      }
    })
  })

  function registerStep(stepProps: IStepProps, el: IStepRegistration['el']) {
    const step = { id: nextStepId++, props: stepProps, el }
    registrations.value = [...registrations.value, step]

    return {
      // Depends only on the step itself, so it is already correct while the following steps are not registered yet
      isActive: computed(() => model.value === step.props.name),
      unregister: () => {
        registrations.value = registrations.value.filter(registeredStep => registeredStep !== step)
      },
    }
  }

  function syncOrder() {
    const orderedSteps = [...registrations.value].sort((left, right) => {
      const leftEl = left.el.value
      const rightEl = right.el.value

      if (!leftEl || !rightEl || leftEl === rightEl) {
        return 0
      }

      const position = leftEl.compareDocumentPosition(rightEl)

      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    })

    if (orderedSteps.some((step, idx) => step !== registrations.value[idx])) {
      registrations.value = orderedSteps
    }
  }

  /**
   * Keyed moves of the steps (a reordered `v-for`, also through wrappers) do not update the `Stepper`,
   * so the order follows the DOM ~ only mutations that insert a step matter, not the changes inside its content
   */
  function handleMutations(mutations: MutationRecord[]) {
    const stepEls = registrations.value.map(step => step.el.value).filter(Boolean) as HTMLElement[]

    const hasInsertedStep = mutations.some(mutation => {
      return [...mutation.addedNodes].some(node => stepEls.some(stepEl => node === stepEl || node.contains(stepEl)))
    })

    if (hasInsertedStep) {
      syncOrder()
    }
  }

  function select(name: string) {
    const step = steps.value.find(step => step.props.name === name)

    if (step?.isSelectable) {
      model.value = name
    }
  }

  // Navigation
  function findEnabledIdx(direction: 1 | -1) {
    for (let idx = activeIdx.value + direction; idx >= 0 && idx < steps.value.length; idx += direction) {
      if (!steps.value[idx]!.isDisabled) {
        return idx
      }
    }

    return -1
  }

  const hasNext = computed(() => findEnabledIdx(1) !== -1)
  const hasPrev = computed(() => findEnabledIdx(-1) !== -1)

  function next() {
    const idx = findEnabledIdx(1)

    if (idx !== -1) {
      model.value = steps.value[idx]!.props.name
    }
  }

  function prev() {
    const idx = findEnabledIdx(-1)

    if (idx !== -1) {
      model.value = steps.value[idx]!.props.name
    }
  }

  return {
    steps,
    registerStep,
    syncOrder,
    handleMutations,
    select,
    next,
    prev,
    hasNext,
    hasPrev,
  }
}

export type IStepperStep = ReturnType<typeof useStepperUtils>['steps']['value'][number]

export const stepperContextKey: InjectionKey<{
  registerStep: ReturnType<typeof useStepperUtils>['registerStep']
  select: ReturnType<typeof useStepperUtils>['select']
  steps: ReturnType<typeof useStepperUtils>['steps']
  ui: ComputedRef<IStepperProps['ui']>
  layout: ComputedRef<'horizontal' | 'horizontalBottom' | 'vertical'>
  size: ComputedRef<NonNullable<IStepperProps['size']>>
  completedIcon: ComputedRef<string | undefined>
  errorIcon: ComputedRef<string | undefined>
}> = Symbol('stepper')
