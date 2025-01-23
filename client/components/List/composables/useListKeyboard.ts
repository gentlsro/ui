// Store
import { useListStore } from '../stores/list.store'

// Provide / Inject
import { formSubmitKey } from '../../Form/provide/form.provide'

export function useListKeyboard() {
  // Injections
  const formSubmit = inject(formSubmitKey, () => {})

  // Store
  const listStore = useListStore()
  const {
    listEl,
    containerEl,
    listItems,
    itemFocused,
    itemFocusedIdx,
  } = storeToRefs(listStore)

  // Layout
  const itemFocusedEl = ref<HTMLDivElement>()
  const { focused } = useFocusWithin(containerEl)

  function handleMouseOver(item: IItem, index: number) {
    if (!('isGroup' in item) && !preventNextHoverEvent.value) {
      itemFocusedIdx.value = index
    }
  }

  // Utils
  const self = getCurrentInstance()
  const modifier = ref(0)

  const { pause, resume } = useIntersectionObserver(
    itemFocusedEl,
    entries => {
      const { intersectionRatio = 1 } = entries[0] ?? {}

      if (intersectionRatio < 1) {
        itemFocusedEl.value?.scrollIntoView({ block: 'nearest' })
      }
      pause()
    },
    { immediate: false },
  )

  /**
   * When we use keyboard to navigate, while having a mouse over some list item,
   * this would cause the mouse to be "stuck" on that item, so we prevent that
   */
  const preventNextHoverEvent = refAutoReset(false, 50)

  const firstNonGroupItemIndex = computed(() => {
    const items = toValue(listItems) ?? []

    return items.findIndex(item => !('isGroup' in item))
  })

  function handleKey(
    ev: KeyboardEvent,
    options?: { force?: boolean, repeated?: boolean },
  ) {
    // NOTE: When we get a `repeated` event, it means the user got under or above the list
    // In that case, we need to adjust situations that would lead to stack overflow,
    // for example when PageDown is pressed while there are only few items in the list
    const { force = false, repeated } = options ?? {}

    const isUnfocused = !focused.value && !force
    if (!listItems.value || isUnfocused) {
      return
    }

    const isCtrl = ev.ctrlKey || ev.metaKey

    switch (ev.key) {
      // Move up
      case 'ArrowUp':
        itemFocusedIdx.value--
        modifier.value = -1
        ev.preventDefault?.()

        break

      // Move down
      case 'ArrowDown':
        itemFocusedIdx.value++
        modifier.value = 1
        ev.preventDefault?.()

        break

        // Move up 5 items
      case 'PageUp':
        itemFocusedIdx.value -= repeated ? 1 : 5
        modifier.value = repeated ? -1 : -5
        ev.preventDefault?.()

        break

        // Move down 5 items
      case 'PageDown':
        itemFocusedIdx.value += repeated ? 1 : 5
        modifier.value = repeated ? 1 : 5
        ev.preventDefault?.()

        break

      case 'Tab':
        $hide()

        return

      // Select
      case 'Enter':
        ev.preventDefault?.()
        listStore.handleSelect(itemFocused.value)

        if (isCtrl) {
          self?.emit('submit')
          formSubmit()
        }

        break
    }

    const items = toValue(listItems) ?? []
    const itemSelected = items[itemFocusedIdx.value]

    // Got to the start or at the end of the list
    if (!itemSelected) {
      // Got above start
      if (itemFocusedIdx.value < 0) {
        listEl.value?.scrollToBottom()
        itemFocusedIdx.value = items.length
      }

      // Got under end
      else {
        listEl.value?.scrollToTop()
        itemFocusedIdx.value = -1
      }

      handleKey(ev, { force: options?.force, repeated: true })
    }

    // Got to a group
    else if ('isGroup' in itemSelected) {
      if (ev.key === 'PageUp') {
        handleKey({ ...ev, key: 'ArrowUp' })
      } else if (ev.key === 'PageDown') {
        handleKey({ ...ev, key: 'ArrowDown' })
      } else {
        handleKey(ev)
      }
    }

    // Got to first non-group item
    else if (
      itemFocusedIdx.value === firstNonGroupItemIndex.value
      && modifier.value === -1
    ) {
      listEl.value?.scrollToTop()
    }

    // Regular item
    else {
      nextTick(() => {
        const listElDom = unrefElement(listEl)
        resume()
        itemFocusedEl.value = listElDom.querySelector(
          '.list-row-item.is-focused',
        ) as HTMLDivElement
      })
    }

    preventNextHoverEvent.value = true
  }

  onKeyStroke(
    ['ArrowUp', 'ArrowDown', 'Enter', 'PageUp', 'PageDown', 'Tab'],
    handleKey,
  )

  whenever(
    () => !focused.value,
    () => itemFocusedIdx.value = -1,
  )

  return {
    listEl,
    containerEl,
    handleMouseOver,
    handleKey,
  }
}
