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
        apply: ({ availableWidth, elements }) => {
          const manualHeight = elements.floating.style.getPropertyValue('--floatingHeight')

          // If we have any maxHeight prop, we just use it, otherwise we don't
          const maxHeight = !isNil(props.maxHeight)
            ? typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
            : undefined

          Object.assign(elements.floating.style, {
            height: manualHeight || undefined,
            maxWidth: `${availableWidth}px`,
            maxHeight,
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
