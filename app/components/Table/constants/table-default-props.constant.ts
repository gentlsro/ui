// @unocss-include

export const TABLE_DEFAULT_PROPS = {
  ui: {
    alternateRowClass() {
      const base = 'bg-slate-100 dark:bg-dark-950'

      return {
        base,
        all: `${base}`,
      } as const
    },

    headerCellClass() {
      const base = 'p-x-1 p-y-2px bg-white dark:bg-black'

      return {
        base,
        all: `${base}`,
      } as const
    },

    headerCellInnerClass() {
      const base = 'font-rem-13 font-semibold tracking-wide leading-tight line-clamp-2'

      return {
        base,
        all: `${base}`,
      } as const
    },

    rowClass() {
      const base = 'flex relative hover:(bg-slate-200 dark:bg-slate-800)'
      const clickable = '[&.is-clickable:hover]:(cursor-pointer)'
      const card = '[&.is-card]:(flex-col gap-y-2px rounded-custom p-2 m-1 dark:bg-black overflow-auto light:(outline-1 outline-ca outline-solid bg-white))'
      const cardSelectable = '[&.is-card.is-selectable]:(cursor-pointer)'
      const cardSelected = '[&.is-card.is-selected]:(outline-1 outline-primary outline-solid bg-primary/15)'
      const cardCell = '[&.is-card_.td]:(grid w-full items-start rounded-custom min-h-6 [grid-template-columns:1fr_3fr])'
      const cardCellLabel = '[&.is-card_.td__label]:(relative text-caption text-xs min-h-6 p-t-1 line-clamp-2 h-full)'
      const cardCellValue = '[&.is-card_.td__value]:(flex items-center gap-1 leading-tight self-center overflow-auto p-x-2)'
      const cardEditableHover = '[&.is-card.is-editable_.td.is-editable:hover]:(shadow-ca shadow-consistent-xs)'
      const cardEditableHoverEditBtn = '[&.is-card.is-editable_.td.is-editable:hover_.edit-btn]:(flex)'
      const cardEditBtn = '[&.is-card.is-editable_.edit-btn]:(!absolute top-1/2 right-0 -translate-y-1/2 bg-white dark:bg-black hidden)'
      const cardCancelEditBtn = '[&.is-card.is-editable_.cancel-edit-btn]:(!absolute top-1/2 right-0 -translate-y-1/2 bg-white dark:bg-black hidden)'
      const cardEditingCancel = '[&.is-card_.td.is-editing_.cancel-edit-btn]:(flex)'
      const cardEditingLabel = '[.tr-split.is-card-editing_&.is-card.is-editable_.td__label]:(color-black dark:color-white)'

      return {
        base,
        clickable,
        card,
        cardSelectable,
        cardSelected,
        cardCell,
        cardCellLabel,
        cardCellValue,
        cardEditableHover,
        cardEditableHoverEditBtn,
        cardEditBtn,
        cardCancelEditBtn,
        cardEditingCancel,
        cardEditingLabel,
        all: `${base} ${clickable} ${card} ${cardSelectable} ${cardSelected} ${cardCell} ${cardCellLabel} ${cardCellValue} ${cardEditableHover} ${cardEditableHoverEditBtn} ${cardEditBtn} ${cardCancelEditBtn} ${cardEditingCancel} ${cardEditingLabel}`,
      } as const
    },

    cellClass() {
      const base = 'relative flex items-center border-ca w-$colWidth overflow-hidden p-x-2'
      const link = '[&_.link]:(truncate font-rem-13)'
      const copyBtn = '[&_.copy-btn]:(absolute right-2 top-2 hidden)'
      const copyBtnHover = '[&:hover_.copy-btn]:(flex)'
      const rowSeparatorVertical = '[.separator--vertical_.is-row_&]:(border-r-1)'
      const rowSeparatorHorizontal = '[.separator--horizontal_.is-row_&]:(border-b-1)'
      const rowSeparatorCell = '[.separator--cell_.is-row_&]:(border-r-1 border-b-1)'
      const rowBorderedFirst = '[.table.is-bordered_.is-row_&:first-child]:(border-l-1)'
      const rowBorderedLast = '[.table.is-bordered_.is-row_&:last-child]:(border-r-1)'

      return {
        base,
        link,
        copyBtn,
        copyBtnHover,
        rowSeparatorVertical,
        rowSeparatorHorizontal,
        rowSeparatorCell,
        rowBorderedFirst,
        rowBorderedLast,
        all: `${base} ${link} ${copyBtn} ${copyBtnHover} ${rowSeparatorVertical} ${rowSeparatorHorizontal} ${rowSeparatorCell} ${rowBorderedFirst} ${rowBorderedLast}`,
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
      const base = 'flex items-start p-x-2 p-y-1 gap-1'

      return {
        base,
        all: `${base}`,
      } as const
    },

    bottomClass() {
      const base = 'relative grid p-x-2 items-center min-h-10 grid-cols-[1fr_auto_1fr] border-t-1 border-ca'

      // Loading
      const loading = '[.is-loading_&]:(absolute flex flex-center left-1/2 -translate-x-1/2 top-0 w-80 rounded-full bg-white/68 dark:bg-dark-950/87 backdrop-blur-sm)'

      // Limit reached
      const limitReached = '[.limit-reached_&]:(absolute flex flex-center gap-2 bg-white dark:bg-dark-950 rounded-custom left-1/2 -translate-x-1/2 p-l-1 p-r-3)'

      return {
        base,
        loading,
        limitReached,
        all: `${base} ${loading} ${limitReached}`,
      } as const
    },

    containerClass() {
      const base = 'relative flex flex-col overflow-auto grow @container'

      return {
        base,
        all: `${base}`,
      } as const
    },

    totalsCellClass() {
      const base = 'font-rem-13 font-semibold tracking-wide p-y-2 border-t-1 border-black dark:border-white'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} as const
