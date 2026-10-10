import { MaskedRegExp } from 'imask'

// Every state on the way to a JS number literal: `-`, `1.`, `.5`, `1e`, `1e-`, `1e-21`
const NUMBER_DRAFT = /^-?(?:(?:\d+(?:\.\d*)?|\.\d*)(?:e[-+]?\d*)?)?$/i

/**
 * The mask of NumberInput's `exact` mode: a number as written in data, in any magnitude (`1e-21`, `1e+21`), with `.`
 * as the decimal separator whatever the locale. The input is complete only for a finite number within `min`/`max`,
 * so drafts such as `-` or `1e`, `Infinity` or an out-of-range value are never committed.
 */
export class MaskedExactNumber extends MaskedRegExp {
  declare min: number
  declare max: number

  constructor(options: { min?: number, max?: number }) {
    super({
      mask: NUMBER_DRAFT,
      prepareChar: (char: string) => char === ',' ? '.' : char,
      parse: (value: string) => value.trim() === '' ? undefined : Number(value),
      // A draft that is not a number yet keeps its text
      format: (value: unknown, masked: { value: string }) => {
        if (isNil(value)) {
          return ''
        }

        return typeof value === 'number' && Number.isFinite(value) ? String(value) : masked.value
      },
    } as ConstructorParameters<typeof MaskedRegExp>[0])

    this.min = options.min ?? Number.NEGATIVE_INFINITY
    this.max = options.max ?? Number.POSITIVE_INFINITY
  }

  override get isComplete() {
    const value = this.typedValue as unknown

    return typeof value === 'number'
      && Number.isFinite(value)
      && value >= this.min
      && value <= this.max
  }
}
