// @unocss-include

import utilsConfig from '$utilsConfig'

// Component types
import type { IBadgeProps } from './client/components/Badge/types/badge-props.type'
import type { IBannerProps } from './client/components/Banner/types/banner-props.type'
import type { IBtnProps } from './client/components/Button/types/btn-props.type'
import type { IButtonGroupProps } from './client/components/ButtonGroup/types/button-group-props.type'
import type { ICheckboxProps } from './client/components/Checkbox/types/checkbox-props.type'
import type { IChipProps } from './client/components/Chip/types/chip-props.type'
import type { ICollapseProps } from './client/components/Collapse/types/collapse-props.type'
import type { IConfirmationProps } from './client/components/Confirmation/types/confirmation-props.type'
import type { ICrudBtnProps } from './client/components/Crud/types/crud-btn-props.type'
import type { IDateInputProps } from './client/components/Inputs/DateInput/types/date-input-props.type'
import type { IDatePickerProps } from './client/components/DatePicker/types/datepicker-props.type'
import type { IDialogProps } from './client/components/Dialog/types/dialog-props.type'
import type { IDrawerProps } from './client/components/Drawer/types/drawer-props.type'
import type { IFieldProps } from './client/components/Field/types/field-props.type'
import type { IHeadingProps } from './client/components/Typography/types/heading-props.type'
import type { IInputLabelProps } from './client/components/InputLabel/types/input-label-props.type'
import type { IInputWrapperProps } from './client/components/InputWrapper/types/input-wrapper-props.type'
import type { IItemProps } from './client/components/Item/types/item-props.type'
import type { IListProps } from './client/components/List/types/list-props.type'
import type { ILoaderProps } from './client/components/Loader/types/loader-props.type'
import type { IMenuConfirmationProps } from './client/components/MenuConfirmation/types/menu-confirmation-props.type'
import type { IMenuProps } from './client/components/Menu/types/menu-props.type'
import type { IMenuProxyProps } from './client/components/MenuProxy/types/menu-proxy-props.type'
import type { IMonthSelectorProps } from './client/components/MonthSelector/types/month-selector-props.type'
import type { INavigationProps } from './client/components/Navigation/types/navigation-props.type'
import type { INotificationRowProps } from './client/components/Notification/types/notification-row-props.type'
import type { INotificationsProps } from './client/components/Notification/types/notifications-props.type'
import type { INumberInputProps } from './client/components/Inputs/NumberInput/types/number-input-props.type'
import type { IProgressBarProps } from './client/components/ProgressBar/types/progress-bar-props.type'
import type { IRadioProps } from './client/components/Radio/types/radio-props.type'
import type { IScrollAreaProps } from './client/components/ScrollArea/types/scroll-area-props.type'
import type { IScrollerProps } from './client/components/Scroller/types/scroller-props.type'
import type { ISectionProps } from './client/components/Section/types/section-props.type'
import type { ISeparatorProps } from './client/components/Separator/types/separator-props.type'
import type { ISkeletonProps } from './client/components/Skeleton/types/skeleton-props.type'
import type { ITabProps } from './client/components/Tabs/types/tab-props.type'
import type { ITabsProps } from './client/components/Tabs/types/tabs-props.type'
import type { ITextAreaInputProps } from './client/components/Inputs/TextArea/types/text-area-props.type'
import type { ITextInputProps } from './client/components/Inputs/TextInput/types/text-input-props.type'
import type { ITextSplitterProps } from './client/components/TextSplitter/types/text-splitter-props.type'
import type { IToggleProps } from './client/components/Toggle/types/toggle-props.type'
import type { ITooltipProps } from './client/components/Tooltip/types/tooltip-props.type'
import type { ITreeProps } from './client/components/Tree/types/tree-props.type'
import type { IVirtualScrollerProps } from './client/components/VirtualScroller/types/virtual-scroller-props.type'
import type { IYearMonthSelectorProps } from './client/components/YearMonthSelector/types/year-month-selector-props.type'
import type { IYearSelectorProps } from './client/components/YearSelector/types/year-selector-props.type'
import type { IPageTitleProps } from './client/components/Page/types/page-title-props.type'
import type { IPageDrawerProps } from './client/components/Page/types/page-drawer-props.type'
import type { IPageWrapperProps } from './client/components/Page/types/page-wrapper-props.type'
import type { IBreadcrumbsProps } from './client/components/Breadcrumbs/types/breadcrumbs-props.type'
import type { IFileInputProps } from './client/components/Inputs/FileInput/types/file-input-props.type'
import type { IFieldWithFormatterProps } from './client/components/Field/types/field-with-formatter.type'
import type { IValueFormatterProps } from './client/components/ValueFormatter/types/value-formatter-props.type'
import type { IColorInputProps } from './client/components/Inputs/ColorInput/types/color-props.type'
import type { ITimeInputProps } from './client/components/Inputs/TimeInput/types/time-input-props.type'
import type { ICurrencyInputProps } from './client/components/Inputs/CurrencyInput/types/currency-input-props.type'
import type { IDurationInputProps } from './client/components/Inputs/DurationInput/types/duration-input-props.type'
import type { IMiniCardProps } from './client/components/Card/types/mini-card-props.type'
import type { IFormProps } from './client/components/Form/types/form-props.type'
import type { ISelectorProps } from './client/components/Selector/types/selector-props.type'
import type { ITableProps } from './client/components/Table/types/table-props.type'
import type { IQueryBuilderProps } from './client/components/QueryBuilder/types/query-builder-props.type'

export const defaultComponentsConfig = {
  // Badge
  badge: {
    props: {
      counter: undefined,
    },
  },

  // Banner
  banner: {
    props: {
      counter: undefined,
      dismissable: undefined,
      iconCenter: undefined,
      label: undefined,
      modelValue: undefined,
      noTransition: undefined,
      outlined: undefined,
      variant: undefined,
    },
    merge: ['ui'],
  },

  // Button
  button: {
    props: {
      align: 'center',
      disabled: undefined,
      disableStyle: 'filled',
      download: undefined,
      exact: undefined,
      external: undefined,
      icon: undefined,
      label: undefined,
      loaderVariant: 'block' as 'inline' | 'block',
      loading: undefined,
      navigateToOptions: undefined,
      noBold: undefined,
      noDim: undefined,
      noHoverEffect: undefined,
      noTruncate: undefined,
      outlined: undefined,
      preset: undefined,
      replace: undefined,
      ripple: true,
      round: undefined,
      rounded: true,
      size: 'md',
      stacked: undefined,
      to: undefined,
      tooltip: undefined,
      type: 'button',
      ui: {},
    },
    merge: ['ui'],
  },

  // Breadcrumbs
  breadcrumbs: {
    props: {
      ui: {
        wrapperClass: 'p-x-1 lg:p-x-3',
        breadcrumbsClass: 'rounded-custom',
      },
    },
    home: {
      icon: 'i-lucide:home',
      path: '/' as string | (() => string),
      label: undefined as undefined | (() => string | undefined),
      component: undefined as any,
    },
    misc: { useLastBreadcrumbAsTitle: true },
    merge: ['ui'],
  },

  // ButtonGroup
  buttonGroup: {
    props: {
      buttons: undefined,
      modelValue: undefined,
      ui: {
        activeClass: 'bg-primary color-white',
      },
    },
    merge: ['ui'],
  },

  // Checkbox
  checkbox: {
    props: {
      checkValue: true,
      color: 'primary',
      comparatorFn: undefined,
      editable: true,
      indeterminate: undefined,
      indeterminateValue: null,
      label: undefined,
      labelClass: undefined,
      modelValue: undefined,
      noHoverEffect: undefined,
      name: undefined,
      size: 'sm',
      uncheckValue: false,
      ui: {},
    },
    merge: ['ui'],
  },

  // Chip
  chip: {
    props: {
      center: undefined,
      hasCopy: undefined,
      hasRemove: undefined,
      icon: undefined,
      label: undefined,
      labelClass: undefined,
      ripple: undefined,
      tooltip: undefined,
    },
    merge: ['tooltip'],
  },

  // Collapse
  collapse: {
    props: {
      expandIcon: () => 'color-primary',
      icon: undefined,
      loading: undefined,
      modelValue: undefined,
      noSeparator: true,
      title: undefined,
      ui: {
        headerClass: isOpen => isOpen
          ? 'p-y-1 bg-white dark:bg-dark-700'
          : 'p-y-1 bg-white dark:bg-dark-700',
      },
    },
    merge: ['ui'],
  },

  // ColorInput
  colorInput: {
    props: {
      stackLabel: true,
      disallowedColors: [],
      ui: {
        borderRadius: '0.5rem',
      },
    },
    merge: ['ui'],
  },

  // Confirmation
  confirmation: {
    props: {
      checkmarkClass: undefined,
      confirmationText: undefined,
      delay: 500,
      noActions: undefined,
      visible: undefined,
    },
  },

  // Crud buttons
  crudBtns: {
    props: {
      btnProps: {
        noDim: true,
        noUppercase: true,
      },
      label: undefined,
      loading: undefined,
      disabled: undefined,
    },
    merge: ['btnProps'],
  },

  // CurrencyInput
  currencyInput: {
    props: {
      disabled: undefined,
      errorTakesSpace: true,
      errorVisible: true,
      size: 'md',
      fractionDigits: 2,
      currencyPosition: 'prepend',
      ui: {
        borderRadius: '0.5rem',
      },
    },
    merge: ['ui'],
  },

  // DateInput
  dateInput: {
    props: {
      autoClose: true,
      debounce: 0,
      disabled: undefined,
      emptyValue: undefined,
      errorTakesSpace: true,
      errorVisible: true,
      immediate: true,
      required: undefined,
      size: 'md',
      stackLabel: true,
      ui: {
        borderRadius: '0.5rem',
      },
      utc: utilsConfig.general.useUtc,
    },
    merge: ['ui'],
  },

  // DatePicker
  datePicker: {
    props: {
      excludedDays: [],
      modelValue: undefined,
      utc: utilsConfig.general.useUtc,
    },
  },

  // Dialog
  dialog: {
    props: {
      ignoreClickOutside: undefined,
      maxHeight: '95%',
      noOverlay: undefined,
      noTransition: undefined,
      position: 'center',
      persistent: undefined,
      title: undefined,
      transitionDuration: 250,
      ui: {
        headerClass: 'font-semibold',
      },
    },
    merge: ['ui'],
  },

  // Drawer
  drawer: {
    props: {
      absolute: undefined,
      breakpoint: 'md',
      fullHeight: undefined,
      modelValue: undefined,
      noTitle: undefined,
      side: 'right',
      title: undefined,
      width: 480,
      ui: {
        titleClass: 'p-x-2',
      },
    },
    merge: ['ui'],
  },

  // DurationInput
  durationInput: {
    props: {
      allowedUnits: ['minute', 'hour', 'day'],
      initialDurationUnit: 'hour',
      errorTakesSpace: true,
      errorVisible: true,
      size: 'md',
      ui: {
        borderRadius: '0.5rem',
      },
    },
    merge: ['ui'],
  },

  // Field
  field: {
    props: {
      size: 'md',
      errorTakesSpace: true,
      errorVisible: true,
      noContent: undefined,
      hasContent: undefined,
      stackLabel: true,
      ui: {
        borderRadius: '0.5rem',
      },
      inputProps: {},
    },
    merge: ['ui', 'inputProps'],
  },

  // FieldWithFormatter
  fieldWithFormatter: {
    props: {
      ui: {
        borderRadius: '0.5rem',
      },
    },
  },

  // FileInput
  fileInput: {
    props: {
      accept: undefined,
      downloadUrl: undefined,
      errorTakesSpace: true,
      multi: undefined,
      useScroller: undefined,
      maxChipsRows: undefined,
      noDownloadButton: undefined,
      noPreview: undefined,
      noBorder: true,
      activeLabelColor: 'unset',
      ui: {
        borderRadius: '0.5rem',
        inputContainerClass: '!bg-transparent',
        inputClass: '!p-0',
      },
    },
    merge: ['ui'],
  },

  // FileInputSimple
  fileInputSimple: {
    props: {
      accept: undefined,
      activeLabelColor: 'unset',
      downloadUrl: undefined,
      errorTakesSpace: true,
      multi: undefined,
      useScroller: undefined,
      maxChipsRows: 3,
      noDownloadButton: undefined,
      noPreview: undefined,
      noBorder: undefined,
      size: 'md',
      stackLabel: true,
    },
    merge: ['ui'],
  },

  // Form
  form: {
    props: {
      editControls: false,
      labelForcedVisibility: true,
      hasControls: undefined,
      submitConfirmation: undefined,
      focusFirstInput: true,
      noShortcuts: undefined,
      icon: 'i-iconamoon:send-bold',
      submitBtnProps: {},
      cancelBtnProps: {},
      preventSubmitOnEnter: true,
      errorsSectionProps: {
        ui: { sectionClass: 'flex flex-col gap-y-2 order-first' },
      },
      ui: {
        submitWrapperClass: 'm-l-auto',
        contentClass: 'flex flex-col grow p-2 gap-2 overflow-auto',
        controlsClass: 'border-t-1 border-ca sticky bottom-0 bg-white dark:bg-darker p-y-1 p-x-2',
        containerClass: 'flex flex-col grow overflow-auto',
        submitClass: 'bg-primary color-white w-40',
        cancelClass: 'w-40',
      },
    },
    confirmationInit: { enabled: true, required: false, editable: true },
    merge: ['ui', 'errorsSectionProps', 'cancelBtnProps', 'submitBtnProps'],
  },

  // Heading
  heading: {
    props: {
      filled: undefined,
      highlighted: false,
      ui: {
        contentClass: 'min-h-10',
      },
    },
    merge: ['ui'],
  },

  // InputLabel
  inputLabel: {
    props: {
      required: undefined,
      activeLabelColor: 'var(--color-primary)',
      ui: {
        labelClass: [
          'color-truegray-600 active:color-blue-500',
          'dark:color-truegray-300 dark:active:color-blue-500',
        ],
        labelInlineWidth: '200px',
      },
    },
    merge: ['ui'],
  },

  // InputWrapper
  inputWrapper: {
    props: {
      cursor: 'cursor-text',
      disabled: undefined,
      errors: undefined,
      errorVisible: undefined,
      hint: undefined,
      layout: 'regular',
      loading: undefined,
      marker: undefined,
      noBorder: undefined,
      noHideFloating: undefined,
      originalValue: undefined,
      preferMargin: undefined,
      readonly: undefined,
      tooltip: undefined,
      ui: {
        appendClass: 'flex gap-1 items-center p-x-2',
        borderRadius: '0.5rem',
        inputContainerClass: 'bg-white dark:bg-black',
        borderColor: {
          base: '#737373',
          focus: 'var(--color-primary)',
        },
      },
    },
    merge: ['ui'],
  },

  // Item
  item: {
    props: {
      disabled: undefined,
      noHoverEffect: undefined,
      readonly: undefined,
      tag: 'div',
    },
  },

  // List
  list: {
    props: {
      rowComponent: 'div',
      itemKey: 'id',
      itemLabel: 'label',
      clearable: true,
      ui: {
        moveHandleClass: 'p-t-1.5 color-ca',
        contentClass: hasSearch => hasSearch ? 'p-x-2 p-t-0' : 'p-2',
        searchClass: 'gap-1 p-2',
        rowClass: () => 'p-r-2 m-y-1px p-y-1 rounded-custom',
        rowStyle: ({ groupsCount }) => ({ paddingLeft: `${(groupsCount || 1) * 8}px` }),
        rowGroupStyle: ({ level }) => ({ paddingLeft: `${level * 8}px` }),
      },
      search: '',
      searchConfig: {
        enabled: true,
        fuseSearchToken: "'",
      },
      sortingConfig: {
        enabled: true,
        sortBy: undefined,
      },
      scrollerConfig: { rowHeight: 36 },
      selection: undefined,
      selectionConfig: {
        enabled: false,
        multi: false,
      },
      loadData: {
        fnc: undefined,
        payloadKey: 'data',
        countKey: 'count',
      },
      addConfig: {
        enabled: false,
        noLocalAdd: false,
        transformAddedItem: undefined,
      },
      searchInputProps: {
        autofocus: true,
      },
      modifiers: {},
    },
    merge: [
      'searchConfig',
      'ui',
      'sortingConfig',
      'selectionConfig',
      'loadData',
      'addConfig',
      'searchInputProps',
      'modifiers',
      'scrollerConfig',
    ],
  },

  // Loader
  loader: {
    props: {
      variant: 'block',
    },
  },

  // Menu
  menu: {
    props: {
      boundary: undefined,
      fallbackPlacements: undefined,
      beforeHideFnc: undefined,
      ignoreClickOutside: undefined,
      manual: undefined,
      modelValue: undefined,
      noBounce: undefined,
      noClose: undefined,
      noTransition: undefined,
      referenceTarget: undefined,
      target: undefined,
      trigger: 'click',
      cover: undefined,
      fit: true,
      maxHeight: '95%',
      matchWidth: undefined,
      noArrow: true,
      noMove: undefined,
      noOverlay: true,
      noUplift: undefined,
      offset: 8,
      placement: undefined,
      persistent: undefined,
      title: undefined,
      transitionDuration: 250,
      virtual: undefined,
      ui: {
        headerClass: 'font-semibold',
      },
    },
    merge: ['ui'],
  },

  // Menu confirmation
  menuConfirmation: {
    props: {
      confirmationText: undefined,
      focusConfirmButton: undefined,
      hasConfirmation: undefined,
      noConfirmBtn: undefined,

      // Menu props
      beforeHideFnc: undefined,
      boundary: undefined,
      cover: undefined,
      fallbackPlacements: undefined,
      fit: false,
      ignoreClickOutside: undefined,
      manual: undefined,
      matchWidth: undefined,
      maxHeight: '95%',
      modelValue: undefined,
      noArrow: false,
      noBounce: undefined,
      noClose: undefined,
      noMove: undefined,
      noOverlay: true,
      noTransition: undefined,
      noUplift: undefined,
      offset: 8,
      persistent: undefined,
      placement: undefined,
      referenceTarget: undefined,
      target: undefined,
      title: undefined,
      transitionDuration: 250,
      trigger: 'click',
      ui: {
        contentClass: 'p-1 gap-y-3',
      },
      virtual: undefined,

    },
    merge: ['ui'],
  },

  // Menu proxy
  menuProxy: {
    props: {
      breakpoint: 'sm',
      ignoreClickOutside: undefined,
      maxHeight: '95%',
      noOverlay: undefined,
      noTransition: undefined,
      persistent: undefined,
      title: undefined,
      transitionDuration: 250,
      ui: {},

      // Menu props
      beforeHideFnc: undefined,
      boundary: undefined,
      cover: undefined,
      fallbackPlacements: undefined,
      fit: true,
      manual: undefined,
      matchWidth: undefined,
      modelValue: undefined,
      noArrow: true,
      noBounce: undefined,
      noClose: undefined,
      noMove: undefined,
      noUplift: undefined,
      offset: 8,
      placement: undefined,
      referenceTarget: undefined,
      target: undefined,
      trigger: 'click',
      virtual: undefined,

      // Dialog props
      position: 'center',
    },
    merge: ['ui'],
  },

  // MiniCard
  miniCard: {
    props: {
      previousValue: undefined,
      emptyValueString: '-',
      ui: {
        iconClass: 'color-blue-500 dark:color-blue-700 h-6 w-6',
        labelClass: 'color-slate-600 dark:color-slate-300 font-rem-14 p-b-1',
        valueClass: 'font-rem-16',
        previousValueClass: 'color-purple-500 dark:color-purple-600',
      },
    },
    merge: ['ui'],
  },

  // MonthSelector
  monthSelector: {
    props: {
      modelValue: undefined,
      referenceTarget: undefined,
    },
  },

  // Navigation
  navigation: {
    props: {
      noToolbar: undefined,
      noShadow: undefined,
      noHide: undefined,
      sticky: undefined,
      ui: {
        navigationClass: 'bg-primary',
      },
    },
    defaultNavigationHeight: 48,
    merge: ['ui'],
  },

  // NotificationRow
  notificationRow: {
    props: {
      notification: undefined,
      noClose: undefined,
    },
  },

  // Notifications
  notifications: {
    props: {
      placement: 'top-right',
    },
  },

  // NumberInput
  numberInput: {
    props: {
      debounce: 0,
      disabled: undefined,
      errorTakesSpace: true,
      errorVisible: true,
      fractionDigits: 2,
      required: undefined,
      size: 'md',
      stackLabel: true,
      min: Number.NEGATIVE_INFINITY,
      max: Number.POSITIVE_INFINITY,
      step: 'auto',
      ui: {
        borderRadius: '0.5rem',
      },
    },
    merge: ['ui'],
  },

  // PageDrawer
  pageDrawer: {
    props: {
      absoluteBreakpoint: 'md',
      absoluteFullWidthBreakpoint: 'md',
      fullHeight: undefined,
      mini: undefined,
      miniWidth: 64,
      modelValue: undefined,
      noBottom: undefined,
      side: 'left',
      width: 280,
      ui: {
        contentClass: () => 'bg-primary color-white',
        bottomClass: () => 'bg-primary color-white p-1',
        fillerClass: () => 'border-b-1',
      },
    },
    merge: ['ui'],
  },

  // PageTitle
  pageTitle: {
    props: {
      title: undefined,
      ui: {
        titleClass: 'font-700',
        containerClass: 'max-w-screen-lg p-y-4 m-b-2 m-l-2',
      },
    },
    merge: ['ui'],
  },

  // PageWrapper
  pageWrapper: {
    props: {
      breadcrumbs: true,
      moveContent: false,
      pad: true,
      ui: {
        containerClass: undefined,
        contentClass: undefined,
      },
    },
    merge: ['ui'],
  },

  // ProgressBar
  progressBar: {
    props: {
      label: undefined,
      progress: undefined,
    },
  },

  // Query builder
  queryBuilder: {
    props: {
      maxLevel: Number.POSITIVE_INFINITY,
      showColumnFilters: true,
    },
  },

  // Radio
  radio: {
    props: {
      color: 'primary',
      comparatorFn: undefined,
      disabled: undefined,
      label: undefined,
      modelValue: undefined,
      noHoverEffect: undefined,
      name: undefined,
      size: 'sm',
      val: undefined,
      ui: {},
    },
    merge: ['ui'],
  },

  // Scroller
  scroller: {
    props: {
      arrows: 'inside',
      ui: {
        contentClass: 'gap-1',
      },
    },
    merge: ['ui'],
  },

  // ScrollArea
  scrollArea: {
    props: {
      options: undefined,
    },
  },

  // SearchInput
  searchInput: {
    props: {
      clearable: true,
      debounce: 0,
      disabled: undefined,
      emptyValue: undefined,
      required: undefined,
      errorVisible: true,
      errorTakesSpace: true,
      ui: {},
    },
    merge: ['ui'],
  },

  // Section
  section: {
    props: {
      bordered: undefined,
      dense: undefined,
      title: undefined,
      subtitle: undefined,
      titleElement: undefined,
      ui: {
        sectionClass: 'max-w-screen-xl p-2',
        contentClass: 'flex flex-col gap-2',
      },
    },
    merge: ['ui'],
  },

  // Selector
  selector: {
    props: {
      preferMargin: true,
      disabled: undefined,
      optionKey: 'id',
      optionLabel: 'label',
      noMenuMatchWidth: undefined,
      clearSearchOnHide: true,
      clearOptionsOnMenuHide: false,
      stackLabel: true,
      errorTakesSpace: true,
      hasContent: undefined,
      ui: {
        borderRadius: '0.5rem',
        inputClass: 'flex items-center',
      },
      listProps: {
        clearable: false,
        ui: {
          contentClass: hasSearch => hasSearch ? 'p-x-2' : 'p-2',
          searchClass: 'gap-1 p-2',
        },
      },
      loadData: {
        onSearch: 300,
      },
      menuProps: {
        position: 'top',
        fit: false,
        manual: true,
        noUplift: true,
        matchWidth: true,
        noArrow: true,
        offset: 0,
        ui: { contentClass: 'p-0' },
      },
    },
    merge: ['ui', 'loadData', 'listProps', 'menuProps'],
  },

  // Separator
  separator: {
    props: {
      inset: undefined,
      spaced: undefined,
      vertical: undefined,
    },
  },

  // Skeleton
  skeleton: {
    props: {
      animationSpeed: 1500,
      variant: 'wave',
    },
  },

  // Tab
  tab: {
    props: {
      name: undefined,
      btnProps: () => ({ noDim: true, noUppercase: true }),
    },
    merge: ['btnProps'],
  },

  // Table
  table: {
    props: {
      bordered: false,
      allowComparatorsOfSameType: false,
      minimumColumnWidth: 80,
      breakpoint: 600,
      editable: false,
      autoFit: {
        onInit: true,
        mode: 'fit-with-header',
        maxColumnWidthChars: 100,
        rowsLimit: 100,
      },
      rowsLimit: 1000,
      emptyValue: null,
      rowKey: 'id',
      separator: 'horizontal',
      splitRows: [
        { breakpoint: 600, count: 2 },
        { breakpoint: 800, count: 3 },
        { breakpoint: 1000, count: 1 },
      ],
      modifiers: {
        caseInsensitive: true,
        useUrl: true,
      },
      paginationConfig: {
        enabled: false,
        pageSize: 25,
        options: [10, 25, 50, 100],
      },
      loadMetaData: {
        columnsKey: 'columns',
        layoutsKey: 'layouts',
        defaultLayoutKey: 'defaultLayout',
      },
      loadData: {
        payloadKey: 'data',
        countKey: 'count',
      },
      queryBuilderProps: {
        allowComparatorsOfSameType: false,
        showColumnFilters: true,
        editable: true,
      },
      selectionConfig: {
        multi: true,
      },
      scrollerConfig: {},
      features: ['export', 'queryBuilder', 'queryBuilderDialog', 'filterChips', 'search', 'sorting', 'autofit', 'columnSelection', 'layouts'],
      ui: {
        headerCellClass: 'p-x-1 p-y-2px bg-white dark:bg-black',
        headerCellInnerClass: 'font-rem-13 font-semibold tracking-wide leading-tight line-clamp-2',
        cellClass: 'overflow-hidden p-x-2',
        cellInnerClass: 'font-rem-13 p-y-1 truncate',
        alternateRowClass: 'bg-primary/15 dark:bg-black',
        rowClass: 'hover:bg-primary/25',
        totalsCellClass: 'font-rem-13 font-semibold tracking-wide p-y-2 border-t-1 border-black dark:border-white',
      },
      initialSchemaConfig: {},
      getFilterComponent: () => undefined,
    },
    merge: [
      'autoFit',
      'loadMetaData',
      'modifiers',
      'selectionConfig',
      'queryBuilderProps',
      'ui',
      'paginationConfig',
      'loadData',
      'initialSchemaConfig',
      'scrollerConfig',
    ],
  },

  // Tabs
  tabs: {
    props: {
      noNav: undefined,
      ui: {
        tabClass: 'fit',
        navigationContentClass: 'flex gap-1',
        tabNavBtnClass: isActive => isActive ? 'bg-primary color-white' : 'color-ca',
      },
    },
    merge: ['ui'],
  },

  // TextArea
  textArea: {
    props: {
      autogrow: false,
      debounce: 0,
      disabled: undefined,
      errorTakesSpace: true,
      errorVisible: true,
      mask: { mask: /.*/ },
      required: undefined,
      size: 'md',
      stackLabel: true,
      ui: {
        borderRadius: '0.5rem',
      },
    },
    merge: ['ui'],
  },

  // TextInput
  textInput: {
    props: {
      allowIncompleteMaskValue: false,
      debounce: 0,
      disabled: undefined,
      emptyValue: undefined,
      errorTakesSpace: true,
      errorVisible: true,
      mask: { mask: /.*/ },
      required: undefined,
      size: 'md',
      stackLabel: true,
      ui: {
        borderRadius: '0.5rem',
        appendClass: 'flex gap-1 items-center p-x-2',
      },
    },
    merge: ['ui'],
  },

  // TextSplitter
  textSplitter: {
    props: {
      modelValue: undefined,
      char: '&#x2022;',
    },
  },

  // TimeInput
  timeInput: {
    props: {
      disabled: undefined,
      errorTakesSpace: true,
      errorVisible: true,
      size: 'md',
      stackLabel: true,
      ui: {
        borderRadius: '0.5rem',
      },
    },
    merge: ['ui'],
  },

  // Toggle
  toggle: {
    props: {
      allowString: undefined,
      checkValue: true,
      contained: true,
      disabled: undefined,
      hoverable: false,
      indeterminateValue: null,
      label: undefined,
      itemProps: undefined,
      modelValue: undefined,
      readonly: undefined,
      size: 'sm',
      uncheckValue: false,
      ui: {
        toggleClass: state => {
          const defaultClass = 'rounded-full border-1 border-ca hover:border-true-gray-400'

          switch (state) {
            case 'checked':
              return [defaultClass, 'bg-positive/15 border-positive']
            case 'unchecked':
              return [defaultClass, 'bg-negative/15 border-negative']
            case 'indeterminate':
              return [defaultClass, 'bg-neutral/15 border-neutral']
          }
        },
        bulletClass: state => {
          const defaultClass = 'rounded-full'

          switch (state) {
            case 'checked':
              return [defaultClass, 'bg-positive']
            case 'unchecked':
              return [defaultClass, 'bg-negative']
            case 'indeterminate':
              return [defaultClass, 'bg-neutral']
          }
        },
      },
    },
    merge: ['ui'],
  },

  // Tooltip
  tooltip: {
    props: {
      delay: undefined,
      noArrow: undefined,
      noInheritFontStyle: true,
      offset: 8,
      placement: undefined,
      referenceTarget: undefined,
      ui: {
        contentClass: 'flex flex-col w-80',
        titleClass: 'font-semibold font-rem-14',
        descriptionClass: 'font-thin text-caption font-rem-12',
      },
    },
    merge: ['ui'],
  },

  // Tree
  tree: {
    props: {
      collapsingConfig: { showCollapsedWhenSearched: true },
      connectors: true,
      loadChildren: undefined,
      maxLevel: Number.MAX_SAFE_INTEGER,
      meta: undefined,
      modelValue: [],
      search: '',
      searchConfig: { enabled: true, fnc: undefined },
      selection: undefined,
      selectionConfig: { multi: false, emitKey: false },
      ui: { nodePadding: '1rem' },
    },
    merge: ['collapsingConfig', 'searchConfig', 'selectionConfig', 'ui'],
  },

  // ValueFormatter
  valueFormatter: {
    props: {
      emptyValueString: '-',
    },
  },

  // VirtualScroller
  virtualScroller: {
    props: {
      initialRowsRenderCount: undefined,
      fetchMore: undefined,
      noScrollEmit: undefined,
      overscan: undefined,
      rows: undefined,
      rowHeight: 40,
      rowKey: 'id' as any,
      threshold: 80,
      watchWidth: undefined,
    },
  },

  // YearMonthSelector
  yearMonthSelector: {
    props: {
      stackLabel: true,
      ui: {
        borderRadius: '0.5rem',
      },
    },
    merge: ['ui'],
  },

  // YearSelector
  yearSelector: {
    props: {
      modelValue: undefined,
      referenceTarget: undefined,
    },
  },
} satisfies IUIConfig

type IConfigItem<T> = {
  props: Partial<T>
  merge?: Array<keyof T>
}

export type IUIConfig = {
  badge: IConfigItem<IBadgeProps>
  banner: IConfigItem<IBannerProps>
  breadcrumbs: IConfigItem<IBreadcrumbsProps> & {
    misc?: { useLastBreadcrumbAsTitle?: boolean }
    home: {
      icon?: string
      path?: string | (() => string)
      label?: string | (() => string | undefined)
      component?: string
    }
  }
  button: IConfigItem<IBtnProps>
  buttonGroup: IConfigItem<IButtonGroupProps>
  checkbox: IConfigItem<ICheckboxProps>
  chip: IConfigItem<IChipProps>
  collapse: IConfigItem<ICollapseProps>
  colorInput: IConfigItem<IColorInputProps>
  confirmation: IConfigItem<IConfirmationProps>
  crudBtns: IConfigItem<ICrudBtnProps>
  currencyInput: IConfigItem<ICurrencyInputProps>
  dateInput: IConfigItem<IDateInputProps>
  datePicker: IConfigItem<IDatePickerProps>
  dialog: IConfigItem<IDialogProps>
  drawer: IConfigItem<IDrawerProps>
  durationInput: IConfigItem<IDurationInputProps>
  field: IConfigItem<IFieldProps>
  fieldWithFormatter: IConfigItem<IFieldWithFormatterProps>
  fileInput: IConfigItem<IFileInputProps>
  fileInputSimple: IConfigItem<IFileInputProps>
  form: IConfigItem<IFormProps> & {
    confirmationInit?: { enabled?: boolean, required?: boolean, editable?: boolean }
  }
  heading: IConfigItem<IHeadingProps>
  inputLabel: IConfigItem<IInputLabelProps>
  inputWrapper: IConfigItem<IInputWrapperProps>
  item: IConfigItem<IItemProps>
  list: IConfigItem<IListProps>
  loader: IConfigItem<ILoaderProps>
  menu: IConfigItem<IMenuProps>
  menuConfirmation: IConfigItem<IMenuConfirmationProps>
  menuProxy: IConfigItem<IMenuProxyProps>
  miniCard: IConfigItem<IMiniCardProps>
  monthSelector: IConfigItem<IMonthSelectorProps>
  navigation: IConfigItem<INavigationProps> & { defaultNavigationHeight: number }
  notificationRow: IConfigItem<INotificationRowProps>
  notifications: IConfigItem<INotificationsProps>
  numberInput: IConfigItem<INumberInputProps>
  pageDrawer: IConfigItem<IPageDrawerProps>
  pageTitle: IConfigItem<IPageTitleProps>
  pageWrapper: IConfigItem<IPageWrapperProps>
  progressBar: IConfigItem<IProgressBarProps>
  queryBuilder: IConfigItem<IQueryBuilderProps>
  radio: IConfigItem<IRadioProps>
  scroller: IConfigItem<IScrollerProps>
  scrollArea: IConfigItem<IScrollAreaProps>
  searchInput: IConfigItem<ITextInputProps>
  section: IConfigItem<ISectionProps>
  selector: IConfigItem<ISelectorProps>
  separator: IConfigItem<ISeparatorProps>
  skeleton: IConfigItem<ISkeletonProps>
  table: IConfigItem<ITableProps>
  tabs: IConfigItem<ITabsProps>
  tab: IConfigItem<ITabProps>
  textArea: IConfigItem<ITextAreaInputProps>
  textInput: IConfigItem<ITextInputProps>
  textSplitter: IConfigItem<ITextSplitterProps>
  timeInput: IConfigItem<ITimeInputProps>
  toggle: IConfigItem<IToggleProps>
  tooltip: IConfigItem<ITooltipProps>
  tree: IConfigItem<ITreeProps>
  valueFormatter: IConfigItem<IValueFormatterProps>
  virtualScroller: IConfigItem<IVirtualScrollerProps<any>>
  yearMonthSelector: IConfigItem<IYearMonthSelectorProps>
  yearSelector: IConfigItem<IYearSelectorProps>
}

export function extendUIConfig<T extends Partial<IUIConfig> & IItem>(config: T): T {
  return config
}

export default extendUIConfig(defaultComponentsConfig)
