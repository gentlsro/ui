export const uiClasses = defineUIClasses('app')({
  badge: { containerClass: { base: 'badge-app', application: 'app-badge', topRight: 'explicit-top-right' } },
  section: { containerClass: { base: 'section-app', application: 'app-section' } },
  checkbox: { containerClass: { base: 'checkbox-app', sizes: { sm: 'checkbox-app-sm' } } },
  toggle: { toggleClass: { base: 'toggle-app', sizes: { sm: 'toggle-app-sm' } } },
  datePicker: { dayClass: { application: 'app-day', selected: 'app-selected' } },
  inputWrapper: { wrapperClass: { base: 'input-app', application: 'app-input' } },
  list: { containerClass: { base: 'list-app', application: 'app-list' } },
  selector: { innerClass: { base: 'selector-app', application: 'app-selector' } },
  button: { containerClass: { base: 'button-app', application: 'app-button' } },
  table: { toolbarClass: { marker: 'app-empty-map' } },
})

export default extendUIConfig({
  helperExtension: {
    props: {
      ui: {
        base: 'helper-default',
        retained: 'helper-retained',
        nested: {
          defaultOnly: 'default-only',
          winner: 'default',
        } as { defaultOnly?: string, winner: string },
        handler: () => 'helper-nested',
      },
      callback: (value: string) => `helper:${value}`,
      labels: ['helper-default'],
    },
    merge: ['ui'] as const,
  },
  helperOptionalMerge: {
    props: { ui: { base: 'optional' } },
    merge: undefined as Array<'ui'> | undefined,
  },
})
