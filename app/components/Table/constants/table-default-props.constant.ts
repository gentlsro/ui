// @unocss-include

export const TABLE_DEFAULT_PROPS = {
  ui: {
    alternateRowClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },

    headerCellClass() {
      const base = 'p-l-2 p-r-1 min-h-9 bg-white dark:bg-true-gray-900 color-true-gray-500 dark:color-true-gray-300'

      return {
        base,
        all: `${base}`,
      } as const
    },

    headerCellInnerClass() {
      const base = 'font-rem-12 font-medium leading-tight line-clamp-2'

      return {
        base,
        all: `${base}`,
      } as const
    },

    rowClass() {
      const base = 'flex relative [:where(&)]:(bg-white dark:bg-darker) hover:(bg-true-gray-50 dark:bg-true-gray-900)'
      const clickable = '[&.is-clickable:hover]:(cursor-pointer)'
      const card = '[&.is-card]:(flex-col gap-y-1 rounded-xl p-3 m-1.5 overflow-auto outline-1 outline-solid outline-true-gray-200 dark:(outline-true-gray-800 bg-true-gray-900) light:(bg-white shadow-sm))'
      const cardSelectable = '[&.is-card.is-selectable]:(cursor-pointer)'
      const cardSelected = '[&.is-card.is-selected]:(outline-2 outline-primary outline-solid bg-primary/8)'
      const cardCell = '[&.is-card_.td]:(grid w-full items-start rounded-custom min-h-6 [grid-template-columns:80px_3fr])'
      const cardCellLabel = '[&.is-card_.td-label]:(relative text-caption text-xs text-right min-h-6 p-t-1 truncate)'
      const cardCellValue = '[&.is-card_.td-value]:(flex items-center gap-1 leading-tight self-center overflow-auto p-x-2)'
      const cardEditableHoverEditBtn = '[&.is-card.is-editable_.td.is-editable:hover_.edit-btn]:(flex)'
      const cardEditBtn = '[&.is-card.is-editable_.edit-btn]:(!absolute top-1/2 right-0 -translate-y-1/2 bg-white dark:bg-black hidden)'
      const cardCancelEditBtn = '[&.is-card.is-editable_.cancel-edit-btn]:(!absolute top-1/2 right-0 -translate-y-1/2 bg-white dark:bg-black hidden)'
      const cardEditingCancel = '[&.is-card_.td.is-editing_.cancel-edit-btn]:(flex)'
      const cardEditingLabel = '[.tr-split.is-card-editing_&.is-card.is-editable_.td-label]:(color-black dark:color-white)'

      return {
        base,
        clickable,
        card,
        cardSelectable,
        cardSelected,
        cardCell,
        cardCellLabel,
        cardCellValue,
        cardEditableHoverEditBtn,
        cardEditBtn,
        cardCancelEditBtn,
        cardEditingCancel,
        cardEditingLabel,
        // all: `${base} ${cardCell} ${cardCellLabel} ${cardCellValue}`,
        all: `${base} ${clickable} ${card} ${cardSelectable} ${cardSelected} ${cardCell} ${cardCellLabel} ${cardCellValue} ${cardEditableHoverEditBtn} ${cardEditBtn} ${cardCancelEditBtn} ${cardEditingCancel} ${cardEditingLabel}`,
      } as const
    },

    rowActionsClass() {
      const base = 'flex justify-end items-center flex-wrap gap-2 p-x-1 bg-inherit border-true-gray-200 dark:border-true-gray-800'

      return { 
        base, 
        all: base,
      } as const
    },

    rowActionsHeaderClass() {
      const base = 'p-x-1 bg-white dark:bg-true-gray-900 border-true-gray-200 dark:border-true-gray-800'

      return { 
        base, 
        all: base,
      } as const
    },

    cellClass() {
      const base = 'relative flex items-center border-true-gray-200 dark:border-true-gray-800 w-$colWidth overflow-hidden p-x-2'
      const link = '[&_.link]:(truncate font-rem-13 underline decoration-true-gray-300 dark:decoration-true-gray-600 underline-offset-3 hover:decoration-current)'
      const copyBtn = '[&_.copy-btn]:(absolute right-1 top-1/2 -translate-y-1/2 hidden rounded-md bg-white dark:bg-true-gray-900 shadow-sm)'
      const copyBtnHover = '[&:hover_.copy-btn]:(flex)'
      const rowSeparatorVertical = '[.separator--vertical_.is-row_&]:(border-r-1)'
      const rowSeparatorHorizontal = '[.separator--horizontal_.is-row_&]:(border-b-1)'
      const rowSeparatorCell = '[.separator--cell_.is-row_&]:(border-r-1 border-b-1)'

      return {
        base,
        link,
        copyBtn,
        copyBtnHover,
        rowSeparatorVertical,
        rowSeparatorHorizontal,
        rowSeparatorCell,
        all: `${base} ${link} ${copyBtn} ${copyBtnHover} ${rowSeparatorVertical} ${rowSeparatorHorizontal} ${rowSeparatorCell}`,
      } as const
    },

    cellInnerClass() {
      const base = 'font-rem-13 p-y-1 truncate'

      return {
        base,
        all: `${base}`,
      } as const
    },

    contentClass() {
      return {
        all: '',
      } as const
    },

    headerClass() {
      const base = 'relative shrink-0'

      return {
        base,
        all: `${base}`,
      } as const
    },

    toolbarClass() {
      return {
        all: '',
      } as const
    },

    topClass() {
      const base = 'flex items-start p-x-3 p-y-2 gap-1'

      return {
        base,
        all: `${base}`,
      } as const
    },

    bottomClass() {
      const base = 'relative grid p-x-3 gap-2 items-center min-h-10 grid-cols-[1fr_auto_1fr] border-t-1 border-true-gray-200 dark:border-true-gray-800 text-xs color-ca'

      // Loading and limit-reached states are styled inside `TableBottom`
      const loading = ''
      const limitReached = ''

      return {
        base,
        loading,
        limitReached,
        all: `${base} ${loading} ${limitReached}`,
      } as const
    },

    containerClass() {
      const base = 'relative flex flex-col overflow-auto grow @container bg-white dark:bg-transparent'

      return {
        base,
        all: `${base}`,
      } as const
    },

    totalsCellClass() {
      const base = 'font-rem-13 font-semibold p-x-2 p-y-2 border-t-1 border-true-gray-200 dark:border-true-gray-700 bg-white dark:bg-true-gray-900'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} as const
