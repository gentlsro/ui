export type IUIState = {
  general: {
    keyboardShortcuts: boolean
  }

  form: {
    confirmation: {
      enabled?: boolean
      required?: boolean
      editable?: boolean
    }
  }

  table: {
    autoSaveSchema: boolean
    fit: 'fit' | 'stretch' | 'justify' | 'fit-with-header' | null
  }
}
