/**
 * Modifiers that used to exist on `ITableProps['modifiers']` but are no longer
 * read by the table. Passing them is silently ignored, so we warn in dev mode.
 *
 * Key = removed modifier name, value = migration hint.
 */
export const TABLE_REMOVED_MODIFIERS: Record<string, string> = {
  exportData: '`modifiers.exportData` was removed in 2.3 and is ignored. '
    + 'Pass export definitions through the `exportData` prop instead '
    + '(`ITableExport[]`, each entry with its own `fnc`). '
    + 'Include `TABLE_EXPORTS_DEFAULT` entries if you want to keep the built-in formats.',
}

/**
 * Returns a warning message for every removed modifier that is present
 * (with a defined value) in the given `modifiers` object.
 */
export function tableGetRemovedModifierWarnings(modifiers?: object | null): string[] {
  if (!modifiers || typeof modifiers !== 'object') {
    return []
  }

  return Object.entries(TABLE_REMOVED_MODIFIERS)
    .filter(([key]) => (modifiers as Record<string, unknown>)[key] !== undefined)
    .map(([, message]) => `[UI] Table: ${message}`)
}
