import type { UIClassPicker, UIResolvedClasses } from '../../app/types/ui-class-config.type'
import type { ICheckboxProps } from '../../app/components/Checkbox/types/checkbox-props.type'
import type { IDatePickerProps } from '../../app/components/DatePicker/types/datepicker-props.type'
import type { IInputWrapperProps } from '../../app/components/InputWrapper/types/input-wrapper-props.type'

type CheckboxDefaults = Parameters<NonNullable<NonNullable<ICheckboxProps['ui']>['containerClass']>>[0]['defaults']
type DayDefaults = Parameters<NonNullable<NonNullable<IDatePickerProps['ui']>['dayClass']>>[0]['defaults']
type InputDefaults = Parameters<NonNullable<NonNullable<IInputWrapperProps['ui']>['wrapperClass']>>[0]['defaults']

export function checkRepresentativeTypes(checkbox: CheckboxDefaults, day: DayDefaults, input: InputDefaults) {
  const checkboxBase: 'checkbox-app' = checkbox.base
  const small: 'checkbox-app-sm' = checkbox.sizes.sm
  const large: 'checkbox-brand-lg' = checkbox.sizes.lg
  const selected: 'app-selected' = day.selected
  const dayBase: 'day-selected' | 'day-idle' = day.base
  const wrapper: 'input-app' = input.base
  // @ts-expect-error Nested maps are not selectable strings.
  checkbox.p('sizes')
  // @ts-expect-error The picker is not a selectable string.
  input.p('p')
  // @ts-expect-error Unrecognized fields must not widen to arbitrary keys.
  day.p('unknown')

  return { checkboxBase, small, large, selected, dayBase, wrapper }
}

export function checkInitiallyEmptySlots(toolbar: UIClassPicker<UIResolvedClasses['table']['toolbarClass']>) {
  const marker: 'app-empty-map' = toolbar.marker
  toolbar.p('marker', 'all')
  // @ts-expect-error An originally empty surface must not gain arbitrary keys.
  toolbar.p('missing')

  return marker
}
