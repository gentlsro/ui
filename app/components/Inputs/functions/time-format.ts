/**
 * Helpers shared by the time inputs and their pickers.
 *
 * Values are always stored as a 24h `HH:mm` string. Only the displayed value
 * depends on whether the current locale uses a 12h clock, so every conversion
 * between the two happens in one place.
 */

export const TIME_PARTS_RE = /^(\d{2}):(\d{2})$/

export const TIME_PERIODS: string[] = ['AM', 'PM']

function pad2(value: string) {
  return value.padStart(2, '0')
}

/** Splits a stored `HH:mm` value – returns `undefined` for partial input. */
export function parseTimeParts(time?: string | null) {
  if (!TIME_PARTS_RE.test(time ?? '')) {
    return undefined
  }

  const [hh = '12', mm = '00'] = time!.split(':')

  return { hh, mm }
}

/** Stored 24h hour → the hour displayed in a 12h locale (`13` → `01`). */
export function toDisplayHour(hh: string, is12h: boolean) {
  const hour = Number(hh)

  if (!is12h || Number.isNaN(hour)) {
    return pad2(hh)
  }

  if (hour === 0 || hour === 12) {
    return '12'
  }

  return pad2(String(hour > 12 ? hour - 12 : hour))
}

/** Displayed hour + period → the stored 24h hour (`01` + `PM` → `13`). */
export function toStoredHour(displayHour: string, is12h: boolean, isAm: boolean) {
  const hour = Number(displayHour)

  if (!is12h || Number.isNaN(hour)) {
    return pad2(displayHour)
  }

  if (isAm) {
    return hour === 12 ? '00' : pad2(String(hour))
  }

  return hour === 12 ? '12' : pad2(String(hour + 12))
}

/** Stored `HH:mm` → the value displayed for the current locale. */
export function toDisplayTime(time: string | undefined, is12h: boolean) {
  const parts = parseTimeParts(time)

  if (!parts) {
    return ''
  }

  return `${toDisplayHour(parts.hh, is12h)}:${parts.mm}`
}

/** Displayed `HH:mm` (+ period) → the stored 24h `HH:mm` value. */
export function toStoredTime(time: string | undefined, is12h: boolean, isAm: boolean) {
  const parts = parseTimeParts(time)

  if (!parts) {
    return ''
  }

  return `${toStoredHour(parts.hh, is12h, isAm)}:${parts.mm}`
}

/** `AM` for stored hours before noon, `PM` otherwise. */
export function getTimePeriod(hh: string) {
  return Number(hh) < 12 ? 'AM' : 'PM'
}
