export const uiClasses = defineUIClasses('ui-theme')({
  badge: { containerClass: { base: 'badge-theme', position: '', theme: 'theme-badge' } },
  section: { containerClass: { base: 'section-theme', theme: 'theme-section' } },
  checkbox: { containerClass: { base: 'checkbox-theme', sizes: { sm: 'checkbox-theme-sm' } } },
  toggle: { toggleClass: { base: 'toggle-theme', sizes: { sm: 'toggle-theme-sm' } } },
  datePicker: {
    dayClass: ({ props }) => ({
      base: props.isSelected ? 'day-selected' : 'day-idle',
      theme: props.day.isWeekend ? 'day-weekend' : 'day-weekday',
    } as const),
  },
  inputWrapper: { wrapperClass: { base: 'input-theme', theme: 'theme-input' } },
  list: { containerClass: { base: 'list-theme', theme: 'theme-list' } },
  selector: { innerClass: { base: 'selector-theme', theme: 'theme-selector' } },
  button: { containerClass: { base: 'button-theme', theme: 'theme-button' } },
  table: { toolbarClass: { marker: 'theme-empty-map' } },
})

export default extendUIConfig({})
