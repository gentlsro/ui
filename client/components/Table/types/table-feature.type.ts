export type TableFeature =
  | 'search'
  | 'queryBuilder'
  | 'queryBuilderDialog'
  | 'filterChips'
  | 'export'
  | 'autofit'
  | 'freeze'
  | 'sorting' // This is technically not a feature, we just need to know if the sorting should be shown in the toolbar
