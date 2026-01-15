export type IValidation = {
  validate: () => { isValid: boolean, errors?: string[] }
  reset: () => void
}
