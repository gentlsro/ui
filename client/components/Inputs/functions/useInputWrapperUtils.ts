// Types
import type { IInputWrapperProps } from '../../InputWrapper/types/input-wrapper-props.type'

export function useInputWrapperUtils() {
  const { isDark } = useTheme()

  function getInputWrapperProps(props: IInputWrapperProps) {
    return reactivePick(
      props,
      'activeLabelColor',
      'disabled',
      'errorTakesSpace',
      'errors',
      'errorVisible',
      'hasContent',
      'hint',
      'label',
      'layout',
      'loading',
      'marker',
      'modelValue',
      'noBorder',
      'originalValue',
      'placeholder',
      'readonly',
      'required',
      'size',
      'stackLabel',
      'noBorder',
      'validation',
      'zod',
      'preferMargin',
    )
  }

  function getInputWrapperStyleVariables(props: IInputWrapperProps) {
    const borderColorBase = typeof props.ui?.borderColor?.base === 'function'
      ? props.ui?.borderColor?.base(isDark.value)
      : props.ui?.borderColor?.base

    const borderColorFocus = typeof props.ui?.borderColor?.focus === 'function'
      ? props.ui?.borderColor?.focus(isDark.value)
      : props.ui?.borderColor?.focus

    const borderColorHover = typeof props.ui?.borderColor?.hover === 'function'
      ? props.ui?.borderColor?.hover(isDark.value)
      : props.ui?.borderColor?.hover

    const styleVariables = {
      '--fontSize': '',
      '--labelFontSize': '',
      '--lineHeight': '',
      '--padding': '',
      '--margin': '',
      '--bodyMargin': '',
      '--borderColorBase': borderColorBase,
      '--borderColorFocus': borderColorFocus || 'var(--color-primary)',
      '--borderColorHover': borderColorHover || borderColorBase,

      // This is a special case
      // We could use the `extendNestedComponentProps` so the `ui` prop gets extended (not overwritten)
      // but we want to have the default `borderRadius` applied basically 100% of the time
      '--borderRadius': props.ui?.borderRadius,
    }

    const preferMargin = !!props.preferMargin
    const isLabelInside = props.layout === 'label-inside'
    const isRegular = props.layout === 'regular'
    const hasLabel = !!props.label

    // Size: sm
    if (props.size === 'sm') {
      styleVariables['--fontSize'] = '14px'
      styleVariables['--lineHeight'] = '24px'
      styleVariables['--padding'] = preferMargin ? '0 12px' : '4px 12px'
      styleVariables['--margin'] = preferMargin ? '4px 0' : '0'

      if (isLabelInside) {
        styleVariables['--padding'] = preferMargin ? '0 12px' : '14px 12px 2px'
        styleVariables['--margin'] = preferMargin ? '14px 0 2px' : '0'

        if (!hasLabel) {
          if (preferMargin) {
            styleVariables['--margin'] = '8px 0'
          } else {
            styleVariables['--padding'] = '8px 12px'
          }
        }
      }

      if (isRegular) {
        styleVariables['--padding'] = preferMargin ? '0px 12px' : '4px 12px'
        styleVariables['--margin'] = preferMargin ? '4px 0px' : '0'

        if (!hasLabel) {
          if (preferMargin) {
            styleVariables['--margin'] = '4px 0'
          } else {
            styleVariables['--padding'] = '4px 12px'
          }
        }
      }
    }

    // Size: md
    else if (props.size === 'md') {
      styleVariables['--fontSize'] = '16px'
      styleVariables['--lineHeight'] = '26px'
      styleVariables['--padding'] = preferMargin ? '0px 12px' : '7px 12px'
      styleVariables['--margin'] = preferMargin ? '7px 0' : '0'

      if (isLabelInside) {
        styleVariables['--padding'] = preferMargin ? '0 12px' : '16px 12px 2px'
        styleVariables['--margin'] = preferMargin ? '16px 0 2px' : '0'

        if (!hasLabel) {
          if (preferMargin) {
            styleVariables['--margin'] = '9px 0'
          } else {
            styleVariables['--padding'] = '9px 12px'
          }
        }
      }

      if (isRegular) {
        styleVariables['--padding'] = preferMargin ? '1px 12px' : '7px 12px'
        styleVariables['--margin'] = preferMargin ? '6px 0' : '0'

        if (!hasLabel) {
          if (preferMargin) {
            styleVariables['--margin'] = '6px 0'
          } else {
            styleVariables['--padding'] = '7px 12px'
          }
        }
      }
    }

    // Size: lg
    else if (props.size === 'lg') {
      styleVariables['--fontSize'] = '18px'
      styleVariables['--lineHeight'] = '28px'
      styleVariables['--padding'] = preferMargin ? '4px 12px' : '10px 12px'
      styleVariables['--margin'] = preferMargin ? '6px 0' : '0'

      if (isLabelInside) {
        styleVariables['--padding'] = preferMargin ? '0 12px' : '20px 12px 6px'
        styleVariables['--margin'] = preferMargin ? '20px 0 6px' : '0'

        if (!hasLabel) {
          if (preferMargin) {
            styleVariables['--margin'] = '13px 0'
          } else {
            styleVariables['--padding'] = '13px 12px'
          }
        }
      }

      if (isRegular) {
        styleVariables['--padding'] = preferMargin ? '2px 12px' : '10px 12px'
        styleVariables['--margin'] = preferMargin ? '8px 0' : '0'

        if (!hasLabel) {
          if (preferMargin) {
            styleVariables['--margin'] = '10px 0 8px'
          } else {
            styleVariables['--padding'] = '10px 12px'
          }
        }
      }
    }

    return styleVariables
  }

  return {
    getInputWrapperProps,
    getInputWrapperStyleVariables,
  }
}
