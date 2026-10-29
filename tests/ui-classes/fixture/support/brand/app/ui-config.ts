export const uiClasses = defineUIClasses('ui-brand')({
  badge: {
    containerClass: ({ defaults }) => {
      const previous: 'badge-theme' = defaults.base

      return { base: 'badge-brand', brand: 'brand-badge', previous } as const
    },
  },
  section: { containerClass: { base: 'section-brand', brand: 'brand-section' } },
  checkbox: { containerClass: { sizes: { lg: 'checkbox-brand-lg' } } },
  toggle: { toggleClass: { sizes: { lg: 'toggle-brand-lg', smContained: 'toggle-brand-contained' } } },
  datePicker: { dayClass: { brand: 'brand-day', selected: 'brand-selected' } },
  inputWrapper: { wrapperClass: { brand: 'brand-input' } },
  list: { containerClass: { brand: 'brand-list' } },
  selector: { innerClass: { brand: 'brand-selector' } },
  button: { containerClass: { brand: 'brand-button' } },
  table: { toolbarClass: { marker: 'brand-empty-map' } },
})

export default extendUIConfig({
  badge: { props: { ui: { containerStyle: () => ({ opacity: 0.75 }) } } },
})
