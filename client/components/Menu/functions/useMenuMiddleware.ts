import type { MaybeElementRef } from '@vueuse/core'
import type { Middleware } from '@floating-ui/dom'
import { arrow, flip, offset, shift, size } from '@floating-ui/vue'

// Types
import type { IMenuProps } from '../types/menu-props.type'

// Middleware
import { cover, fitWidth, matchWidth } from '../../FloatingUI/functions/useFloatingUIUtils'

export function useMenuMiddleware(
  props: IMenuProps,
  options: { arrowEl: MaybeElementRef },
) {
  const { arrowEl } = options

  const middleware = computed(() => {
    const middleware: Middleware[] = [
      ...(props.fit ? [fitWidth] : []),
      ...(props.matchWidth ? [matchWidth] : []),
      ...(props.cover ? [cover] : []),
      shift({ padding: 0 }),
      size({
        apply: ({ availableWidth, availableHeight, elements }) => {
          const manualHeight = elements.floating.style.getPropertyValue('--floatingHeight')

          // If we have any maxHeight prop, we just use it, otherwise we don't
          let maxHeight = availableHeight

          if (typeof props.maxHeight === 'number') {
            maxHeight = Math.min(maxHeight, props.maxHeight)
          }

          else if (typeof props.maxHeight === 'string' && props.maxHeight.endsWith('%')) {
            maxHeight = Math.min(maxHeight, window.innerHeight * Number.parseFloat(props.maxHeight) / 100)
          }

          else if (typeof props.maxHeight === 'string' && props.maxHeight.endsWith('vh')) {
            maxHeight = Math.min(maxHeight, Number.parseFloat(props.maxHeight.replace('vh', '')) * window.innerHeight)
          }

          Object.assign(elements.floating.style, {
            height: manualHeight || undefined,
            maxWidth: `${availableWidth}px`,
            maxHeight: `${Math.max(maxHeight, 320)}px`,
          })
        },
        boundary: props.boundary,
        padding: 8,
      }),
      flip({
        fallbackPlacements: props.fallbackPlacements,
        fallbackStrategy: 'initialPlacement',
      }),

    ]

    // Offset
    if (props.offset) {
      middleware.unshift(offset(props.offset))
    }

    // Arrow
    if (!props.noArrow) {
      middleware.push(arrow({ element: arrowEl, padding: 8 }))
    }

    return middleware
  })

  return {
    middleware,
  }
}
