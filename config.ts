// @unocss-include

import { utilsConfig } from '$utilsConfig'

// Types
import type { IUIState } from './app/types/ui-state.type'

// Component types
import type { IBadgeProps } from './app/components/Badge/types/badge-props.type'
import type { IBannerProps } from './app/components/Banner/types/banner-props.type'
import type { IBreadcrumbsProps } from './app/components/Breadcrumbs/types/breadcrumbs-props.type'
import type { IBtnProps } from './app/components/Button/types/btn-props.type'
import type { IButtonGroupProps } from './app/components/ButtonGroup/types/button-group-props.type'
import type { ICheckboxProps } from './app/components/Checkbox/types/checkbox-props.type'
import type { IChipProps } from './app/components/Chip/types/chip-props.type'
import type { ICircleProgressProps } from './app/components/CircleProgress/types/circle-progress-props.type'
import type { ICollapseProps } from './app/components/Collapse/types/collapse-props.type'
import type { IColorInputProps } from './app/components/Inputs/ColorInput/types/color-props.type'
import type { IConfirmationProps } from './app/components/Confirmation/types/confirmation-props.type'
import type { ICrudBtnsProps, ICrudEditBtnProps } from './app/components/Crud/types/crud-btn-props.type'
import type { ICurrencyInputProps } from './app/components/Inputs/CurrencyInput/types/currency-input-props.type'
import type { IDateInputProps } from './app/components/Inputs/DateInput/types/date-input-props.type'
import type { IDatePickerProps } from './app/components/DatePicker/types/datepicker-props.type'
import type { IDialogProps } from './app/components/Dialog/types/dialog-props.type'
import type { IDrawerProps } from './app/components/Drawer/types/drawer-props.type'
import type { IDurationInputProps } from './app/components/Inputs/DurationInput/types/duration-input-props.type'
import type { IElementMovementProps } from './app/components/ElementMovement/types/element-movement-props.type'
import type { IFieldProps } from './app/components/Field/types/field-props.type'
import type { IFieldWithFormatterProps } from './app/components/Field/types/field-with-formatter.type'
import type { IFileInputProps } from './app/components/Inputs/FileInput/types/file-input-props.type'
import type { IFormProps } from './app/components/Form/types/form-props.type'
import type { IHeadingProps } from './app/components/Typography/types/heading-props.type'
import type { IHorizontalScrollerProps, IVerticalScrollerProps } from './app/components/Scroller/types/scroller-props.type'
import type { IIconInputProps } from './app/components/Inputs/IconInput/types/icon-input-props.type'
import type { IInputLabelProps } from './app/components/InputLabel/types/input-label-props.type'
import type { IInputWrapperProps } from './app/components/InputWrapper/types/input-wrapper-props.type'
import type { IItemProps } from './app/components/Item/types/item-props.type'
import type { IKeyboardShortcutProps } from './app/components/KeyboardShortcut/types/keyboard-shortcut-props.type'
import type { IListProps } from './app/components/List/types/list-props.type'
import type { ILoaderProps } from './app/components/Loader/types/loader-props.type'
import type { IMainBarProps } from './app/components/MainBar/types/main-bar-props.type'
import type { IMenuConfirmationProps } from './app/components/MenuConfirmation/types/menu-confirmation-props.type'
import type { IMenuProps } from './app/components/Menu/types/menu-props.type'
import type { IMenuProxyProps } from './app/components/MenuProxy/types/menu-proxy-props.type'
import type { IMiniCardProps } from './app/components/Card/types/mini-card-props.type'
import type { IMonthSelectorGridProps } from './app/components/MonthSelector/types/month-selector-grid-props.type'
import type { IMonthSelectorProps } from './app/components/MonthSelector/types/month-selector-props.type'
import type { INavigationProps } from './app/components/Navigation/types/navigation-props.type'
import type { INotificationRowProps } from './app/components/Notification/types/notification-row-props.type'
import type { INotificationsProps } from './app/components/Notification/types/notifications-props.type'
import type { INumberInputProps } from './app/components/Inputs/NumberInput/types/number-input-props.type'
import type { IPageDrawerProps } from './app/components/Page/types/page-drawer-props.type'
import type { IPageTitleProps } from './app/components/Page/types/page-title-props.type'
import type { IPageWrapperProps } from './app/components/Page/types/page-wrapper-props.type'
import type { IProgressBarProps } from './app/components/ProgressBar/types/progress-bar-props.type'
import type { IQueryBuilderProps } from './app/components/QueryBuilder/types/query-builder-props.type'
import type { IRadioProps } from './app/components/Radio/types/radio-props.type'
import type { IScrollAreaProps } from './app/components/ScrollArea/types/scroll-area-props.type'
import type { ISectionProps } from './app/components/Section/types/section-props.type'
import type { ISelectorProps } from './app/components/Selector/types/selector-props.type'
import type { ISeparatorProps } from './app/components/Separator/types/separator-props.type'
import type { ISkeletonProps } from './app/components/Skeleton/types/skeleton-props.type'
import type { ITableProps } from './app/components/Table/types/table-props.type'
import type { ITabProps } from './app/components/Tabs/types/tab-props.type'
import type { ITabsProps } from './app/components/Tabs/types/tabs-props.type'
import type { ITextAreaInputProps } from './app/components/Inputs/TextArea/types/text-area-props.type'
import type { ITextInputProps } from './app/components/Inputs/TextInput/types/text-input-props.type'
import type { ITimeInputProps } from './app/components/Inputs/TimeInput/types/time-input-props.type'
import type { IToggleProps } from './app/components/Toggle/types/toggle-props.type'
import type { ITooltipProps } from './app/components/Tooltip/types/tooltip-props.type'
import type { ITreeProps } from './app/components/Tree/types/tree-props.type'
import type { IValueFormatterProps } from './app/components/ValueFormatter/types/value-formatter-props.type'
import type { IVirtualScrollerProps } from './app/components/VirtualScroller/types/virtual-scroller-props.type'
import type { IVirtualScrollerVerticalProps } from './app/components/VirtualScroller/types/virtual-scroller-vertical-props.type'
import type { IYearMonthSelectorProps } from './app/components/YearMonthSelector/types/year-month-selector-props.type'
import type { IYearSelectorProps } from './app/components/YearSelector/types/year-selector-props.type'

export const defaultComponentsConfig = {
  // Badge
  badge: {
    props: {
      counter: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
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
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        iconClass: ({ defaults }) => defaults.all,
        labelClass: ({ defaults }) => defaults.all,
        badgeClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // Breadcrumbs
  breadcrumbs: {
    props: {
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        breadcrumbsClass: ({ defaults }) => defaults.all,
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

  // Button
  button: {
    props: {
      align: 'center',
      disabled: undefined,
      disableStyle: 'filled' as 'filled' | 'flat',
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
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        iconClass: ({ defaults }) => defaults.all,
        labelClass: ({ defaults }) => defaults.all,
        focusHelperClass: ({ defaults }) => defaults.all,
        loadingClass: ({ defaults }) => defaults.all,
        loaderClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // ButtonGroup
  buttonGroup: {
    props: {
      buttons: undefined,
      disabled: undefined,
      modelValue: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        activeClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // Checkbox
  checkbox: {
    props: {
      checkValue: true,
      color: 'primary',
      readonly: undefined,
      comparatorFn: undefined,
      indeterminate: undefined,
      indeterminateValue: null,
      label: undefined,
      labelClass: undefined,
      modelValue: undefined,
      noHoverEffect: undefined,
      name: undefined,
      size: 'sm',
      uncheckValue: false,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        checkboxClass: ({ defaults }) => defaults.all,
        labelClass: ({ defaults }) => defaults.all,
        focusHelperClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // CircleProgress
  circleProgress: {
    props: {
      color: undefined,
      noProgressText: undefined,
      progress: undefined,
      size: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        svgClass: ({ defaults }) => defaults.all,
        circleBgClass: ({ defaults }) => defaults.all,
        circleClass: ({ defaults }) => defaults.all,
        textClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // Chip
  chip: {
    props: {
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        labelClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['tooltip', 'removeBtn', 'ui'],
  },

  // Collapse
  collapse: {
    props: {
      icon: undefined,
      loading: undefined,
      modelValue: undefined,
      title: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        headerClass: ({ defaults }) => defaults.all,
        headerRightClass: ({ defaults }) => defaults.all,
        titleClass: ({ defaults }) => defaults.all,
        subtitleClass: ({ defaults }) => defaults.all,
        expandIconClass: ({ defaults }) => defaults.all,
        textClass: ({ defaults }) => defaults.all,
        contentClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // ColorInput
  colorInput: {
    props: {
      stackLabel: true,
      disallowedColors: [],
      size: 'md',
      noIcon: true,
      ui: {
        borderRadius: '0.5rem',
        appendClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // Confirmation
  confirmation: {
    props: {
      confirmationText: undefined,
      delay: 500,
      noActions: undefined,
      visible: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        checkmarkClass: ({ defaults }) => defaults.all,
        textClass: ({ defaults }) => defaults.all,
        actionsClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // Crud buttons
  crudBtns: {
    props: {
      actions: undefined,
      labels: undefined,
      loading: undefined,
      btnConfirmationPosition: 'bottom',
      ui: {
        containerClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui', 'btnProps'],
  },

  // Crud edit button
  crudEditBtn: {
    props: {
      disabled: undefined,
      editing: undefined,
      btnProps: {},
      ui: {
        wrapperClass: ({ defaults }) => defaults.all,
        btnClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui', 'btnProps'],
  },

  // CurrencyInput
  currencyInput: {
    props: {
      disabled: undefined,
      readonly: undefined,
      errorTakesSpace: true,
      errorVisible: true,
      size: 'md',
      fractionDigits: 2,
      currencyPosition: 'prepend',
      ui: {
        borderRadius: '0.5rem',
        appendClass: ({ defaults }) => defaults.all,
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
      readonly: undefined,
      emptyValue: undefined,
      errorTakesSpace: true,
      errorVisible: true,
      immediate: true,
      required: undefined,
      size: 'md',
      stackLabel: true,
      ui: {
        borderRadius: '0.5rem',
        appendClass: ({ defaults }) => defaults.all,
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
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        daysGridClass: ({ defaults }) => defaults.all,
        controlsClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // Dialog
  dialog: {
    props: {
      dense: undefined,
      ignoreClickOutside: undefined,
      maxHeight: '95%',
      noClose: undefined,
      noOverlay: undefined,
      noTransition: undefined,
      position: 'center',
      persistent: undefined,
      title: undefined,
      transitionDuration: 250,
      ui: {
        backdropClass: ({ defaults }) => defaults.all,
        wrapperClass: ({ defaults }) => defaults.all,
        dialogClass: ({ defaults }) => defaults.all,
        headerClass: ({ defaults }) => defaults.all,
        titleClass: ({ defaults }) => defaults.all,
        contentClass: ({ defaults }) => defaults.all,
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
        containerClass: ({ defaults }) => defaults.all,
        titleClass: ({ defaults }) => defaults.all,
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
      readonly: undefined,
      size: 'md',
      ui: {
        borderRadius: '0.5rem',
      },
    },
    merge: ['ui'],
  },

  // // ElementMovement
  elementMovement: {
    props: {},
    merge: [],
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
      readonly: undefined,
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
      readonly: undefined,
      multi: undefined,
      useScroller: undefined,
      maxChipsRows: undefined,
      noDownloadButton: undefined,
      noPreview: undefined,
      noBorder: true,
      activeLabelColor: 'unset',
      ui: {
        borderRadius: '0.5rem',
        inputContainerClass: () => '!bg-transparent',
        inputClass: () => '!p-0',
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
      readonly: undefined,
      useScroller: undefined,
      maxChipsRows: 3,
      noDownloadButton: undefined,
      noPreview: undefined,
      noBorder: undefined,
      size: 'md',
      stackLabel: true,
      ui: {
        appendClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // Form
  form: {
    props: {
      bordered: undefined,
      editControls: false,
      editDisabled: false,
      errors: undefined,
      label: undefined,
      icon: 'i-iconamoon:send-bold',
      loading: undefined,
      focusFirstInput: true,
      isEditing: undefined,
      controlsOnTop: undefined,
      errorsOnTop: undefined,
      hasControls: undefined,
      labelForcedVisibility: true,
      noControls: undefined,
      noEditControls: undefined,
      noShortcuts: undefined,
      noSubmit: undefined,
      noEnter: undefined,
      preventSubmitOnEnter: true,
      reset: undefined,
      submitConfirmation: undefined,
      submitConfirmationText: undefined,
      submitBtnProps: {},
      cancelBtnProps: {},
      editBtnProps: {},
      errorsSectionProps: {
        ui: { sectionClass: 'flex flex-col gap-y-2 order-first' },
      },
      submitDisabled: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        contentClass: ({ defaults }) => defaults.all,
        controlsClass: ({ defaults }) => defaults.all,
        submitWrapperClass: ({ defaults }) => defaults.all,
        submitClass: ({ defaults }) => defaults.all,
        cancelClass: ({ defaults }) => defaults.all,
      },
    },
    confirmationInit: { enabled: true, required: false, editable: true },
    merge: ['ui', 'errorsSectionProps', 'cancelBtnProps', 'submitBtnProps', 'editBtnProps'],
  },

  // Heading
  heading: {
    props: {
      filled: undefined,
      highlighted: false,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // Icon input
  iconInput: {
    props: {
      debounce: 0,
      disabled: undefined,
      readonly: undefined,
      emptyValue: undefined,
      errorTakesSpace: true,
      errorVisible: true,
      mask: { mask: /.*/ },
      required: undefined,
      size: 'md',
      stackLabel: true,
      minSearchLength: 1,
      ui: {
        borderRadius: '0.5rem',
        appendClass: ({ defaults }) => defaults.all,
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
        labelClass: ({ defaults }) => defaults.all,
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
      readonly: undefined,
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
      tooltip: undefined,
      ui: {
        borderRadius: '0.5rem',
        borderColor: {
          base: '#737373',
          focus: 'var(--color-primary)',
        },
        appendClass: ({ defaults }) => defaults.all,
        inputContainerClass: ({ defaults }) => defaults.all,
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
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        focusHelperClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // List
  list: {
    props: {
      rowComponent: 'div',
      itemKey: 'id',
      itemLabel: 'label',
      clearable: true,
      ui: {
        rowStyle: ({ groupsCount }) => ({ paddingLeft: `${(groupsCount || 1) * 8}px` }),
        rowGroupStyle: ({ level }) => ({ paddingLeft: `${level * 8}px` }),
        containerClass: ({ defaults }) => defaults.all,
        searchClass: ({ defaults }) => defaults.all,
        moveHandleClass: ({ defaults }) => defaults.all,
        contentClass: ({ defaults }) => defaults.all,
        rowClass: ({ defaults }) => defaults.all,
        rowContentClass: ({ defaults }) => defaults.all,
        noDataClass: ({ defaults }) => defaults.all,
        loadingClass: ({ defaults }) => defaults.all,
        rowGroupClass: ({ defaults }) => defaults.all,
        moveHandleIconClass: ({ defaults }) => defaults.all,
      },
      search: '',
      searchConfig: {
        enabled: true,
        fuseSearchToken: "'",
        inputProps: {
          autofocus: true,
        },
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
      modifiers: {},
    },
    merge: [
      'ui',
      'sortingConfig',
      'selectionConfig',
      'loadData',
      'addConfig',
      'searchConfig',
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
      transitionDuration: 180,
      ui: {
        menuClass: ({ defaults }) => defaults.all,
        contentClass: ({ defaults }) => defaults.all,
        headerClass: ({ defaults }) => defaults.all,
        titleClass: ({ defaults }) => defaults.all,
        overlayClass: ({ defaults }) => defaults.all,
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
        confirmBtnClass: ({ defaults }) => defaults.all,
      },
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
        containerClass: ({ defaults }) => defaults.all,
        iconContainerClass: ({ defaults }) => defaults.all,
        iconClass: ({ defaults }) => defaults.all,
        contentClass: ({ defaults }) => defaults.all,
        labelClass: ({ defaults }) => defaults.all,
        valueClass: ({ defaults }) => defaults.all,
        previousValueClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // MonthSelector
  monthSelector: {
    props: {
      modelValue: undefined,
      referenceTarget: undefined,
      utc: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        previousBtnClass: ({ defaults }) => defaults.all,
        currentBtnClass: ({ defaults }) => defaults.all,
        nextBtnClass: ({ defaults }) => defaults.all,
        gridContainerClass: ({ defaults }) => defaults.all,
        monthBtnClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // MonthSelectorGrid
  monthSelectorGrid: {
    props: {
      modelValue: undefined,
      utc: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        monthBtnClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // Navigation
  navigation: {
    props: {
      noToolbar: undefined,
      noShadow: undefined,
      noHide: undefined,
      sticky: undefined,
      ui: {
        headerClass: ({ defaults }) => defaults.all,
        navigationClass: ({ defaults }) => defaults.all,
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
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        titleRowClass: ({ defaults }) => defaults.all,
        iconClass: ({ defaults }) => defaults.all,
        titleClass: ({ defaults }) => defaults.all,
        titleTextClass: ({ defaults }) => defaults.all,
        subtitleClass: ({ defaults }) => defaults.all,
        subtitleItemClass: ({ defaults }) => defaults.all,
        counterClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // Notifications
  notifications: {
    props: {
      placement: 'top-right',
      ui: {
        containerClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // NumberInput
  numberInput: {
    props: {
      debounce: 0,
      disabled: undefined,
      readonly: undefined,
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
        appendClass: ({ defaults }) => defaults.all,
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
        containerClass: ({ defaults }) => defaults.all,
        contentClass: ({ defaults }) => defaults.all,
        bottomClass: ({ defaults }) => defaults.all,
        fillerClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // PageTitle
  pageTitle: {
    props: {
      title: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        pageTitleClass: ({ defaults }) => defaults.all,
        titleClass: ({ defaults }) => defaults.all,
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
        containerClass: ({ defaults }) => defaults.all,
        contentClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // ProgressBar
  progressBar: {
    props: {
      label: undefined,
      progress: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        innerClass: ({ defaults }) => defaults.all,
        colorClass: ({ defaults }) => defaults.all,
        whiteBgClass: ({ defaults }) => defaults.all,
        blackBgClass: ({ defaults }) => defaults.all,
        textClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // Query builder
  queryBuilder: {
    props: {
      allowNegation: false,
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
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        radioClass: ({ defaults }) => defaults.all,
        labelClass: ({ defaults }) => defaults.all,
        focusHelperClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // HorizontalScroller
  horizontalScroller: {
    props: {
      arrows: 'inside',
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        contentClass: ({ defaults }) => defaults.all,
        arrowClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // VerticalScroller
  verticalScroller: {
    props: {
      arrows: 'inside',
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        contentClass: ({ defaults }) => defaults.all,
        arrowClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // ScrollArea
  scrollArea: {
    props: {
      options: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // SearchInput
  searchInput: {
    props: {
      clearable: true,
      debounce: 0,
      readonly: undefined,
      disabled: undefined,
      required: undefined,
      errorVisible: true,
      errorTakesSpace: true,
      emptyValue: '',
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
      headingProps: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        titleClass: ({ defaults }) => defaults.all,
        subtitleClass: ({ defaults }) => defaults.all,
        contentClass: ({ defaults }) => defaults.all,
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
      required: undefined,
      hasContent: undefined,
      chipProps: {
        ui: {
          containerClass: ({ defaults }) => `${defaults.all} min-w-20`,
        },
      },
      ui: {
        borderRadius: '0.5rem',
        inputClass: ({ defaults }) => `${defaults.all} flex items-center`,
        appendClass: ({ defaults }) => defaults.all,
        innerClass: ({ defaults }) => defaults.all,
        labelClass: ({ defaults }) => defaults.all,
        contentClass: ({ defaults }) => defaults.all,
        inputContainerClass: ({ defaults }) => defaults.all,
        inputInnerContainerClass: ({ defaults }) => defaults.all,
      },
      listProps: {
        clearable: false,
        ui: {
          contentClass: ({ defaults }) => defaults.all,
          searchClass: ({ defaults }) => defaults.all,
        },
        scrollerConfig: {
          ui: {
            rowClass: ({ defaults }) => `${defaults.all} p-b-px`,
          },
        },
      },
      loadData: {
        onSearch: 300,
      },
      menuProps: {
        position: 'top',
        fit: false,
        dense: true,
        manual: true,
        noUplift: true,
        matchWidth: true,
        noArrow: true,
        offset: 0,
      },
    },
    merge: ['ui', 'loadData', 'listProps', 'menuProps', 'chipProps'],
  },

  // Separator
  separator: {
    props: {
      inset: undefined,
      spaced: undefined,
      vertical: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // Skeleton
  skeleton: {
    props: {
      animationSpeed: 1500,
      variant: 'wave',
      ui: {
        containerClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // MainBar
  mainBar: {
    props: {
      actions: undefined,
      loading: undefined,
      noBreadcrumbs: undefined,
      subtitle: undefined,
      title: undefined,
      titleTruncate: undefined,
      headingProps: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        contentClass: ({ defaults }) => defaults.all,
        titleWrapperClass: ({ defaults }) => defaults.all,
        titleClass: ({ defaults }) => defaults.all,
        subtitleClass: ({ defaults }) => defaults.all,
        actionsClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui', 'headingProps'],
  },

  // KeyboardShortcut
  keyboardShortcut: {
    props: {
      char: undefined,
      forceVisibility: undefined,
      icon: undefined,
      noPlus: undefined,
      withAlt: undefined,
      withCtrl: undefined,
      withShift: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        wrapperClass: ({ defaults }) => defaults.all,
        iconClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // // Tab
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
      toLinkProps: {},
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
      'toLinkProps',
    ],
  },

  // Tabs
  tabs: {
    props: {
      noNav: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        navigationClass: ({ defaults }) => defaults.all,
        navigationContentClass: ({ defaults }) => defaults.all,
        tabClass: ({ defaults }) => defaults.all,
        tabNavBtnClass: ({ defaults }) => defaults.all,
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
      readonly: undefined,
      errorTakesSpace: true,
      errorVisible: true,
      mask: { mask: /.*/ },
      required: undefined,
      size: 'md',
      stackLabel: true,
      ui: {
        borderRadius: '0.5rem',
        appendClass: ({ defaults }) => defaults.all,
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
      readonly: undefined,
      emptyValue: undefined,
      errorTakesSpace: true,
      errorVisible: true,
      mask: { mask: /.*/ },
      required: undefined,
      size: 'md',
      stackLabel: true,
      ui: {
        borderRadius: '0.5rem',
        appendClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // TimeInput
  timeInput: {
    props: {
      disabled: undefined,
      errorTakesSpace: true,
      errorVisible: true,
      size: 'md',
      readonly: undefined,
      stackLabel: true,
      ui: {
        borderRadius: '0.5rem',
        appendClass: ({ defaults }) => defaults.all,
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
      noHoverEffect: undefined,
      allowIndeterminate: undefined,
      indeterminateValue: null,
      label: undefined,
      modelValue: undefined,
      readonly: undefined,
      size: 'sm',
      uncheckValue: false,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        toggleClass: ({ defaults }) => defaults.all,
        bulletClass: ({ defaults }) => defaults.all,
        labelClass: ({ defaults }) => defaults.all,
        iconClass: ({ defaults }) => defaults.all,
        focusHelperClass: ({ defaults }) => defaults.all,
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
        containerClass: ({ defaults }) => defaults.all,
        contentClass: ({ defaults }) => defaults.all,
        titleClass: ({ defaults }) => defaults.all,
        descriptionClass: ({ defaults }) => defaults.all,
        arrowClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // Tree
  tree: {
    props: {
      collapseConfig: {
        expandedLevelOnInit: 0,
        showCollapsedWhenSearched: true,
        btnTakesSpace: true,
        btnProps: { size: 'xs', noHoverEffect: true, class: 'self-start m-t-1.5 color-ca' },
      },
      connectors: true,
      loadChildrenConfig: undefined,
      maxLevel: Number.MAX_SAFE_INTEGER,
      meta: undefined,
      modelValue: [],
      search: '',
      childrenKey: 'children',
      parentKey: 'parentId',
      searchConfig: {
        enabled: true,
        fnc: undefined,
      },
      selection: undefined,
      selectionConfig: {
        multi: false,
        emitKey: false,
        checkboxProps: { size: 'sm', noHoverEffect: true, class: 'm-t-2px m-l--2' },
      },
      dndConfig: { enabled: false, dropMode: 'parent' },
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        contentClass: ({ defaults }) => defaults.all,
        nodeClass: ({ defaults }) => defaults.all,
        nodeContentClass: ({ defaults }) => defaults.base,
        noDataClass: ({ defaults }) => defaults.all,
        actionsClass: ({ defaults }) => defaults.all,
        searchClass: ({ defaults }) => defaults.all,
        nodePadding: '1rem',
      },
      scrollerConfig: {
        rowHeight: 36,
        ui: { rowClass: ({ defaults }) => defaults.all },
      },
      actionsConfig: {
        enabled: true,
        btnProps: { size: 'sm' },
        autoLoadChildrenOnExpandAll: false,
      },
    },
    merge: [
      'collapseConfig',
      'searchConfig',
      'selectionConfig',
      'dndConfig',
      'ui',
      'scrollerConfig',
      'actionsConfig',
      'loadChildrenConfig',
      'sortingConfig',
    ],
  },

  // ValueFormatter
  valueFormatter: {
    props: {
      emptyValueString: '-',
      ui: {
        containerClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // VirtualScroller
  virtualScroller: {
    props: {
      initialRowsRenderCount: undefined,
      fetchMore: undefined,
      noScrollEmit: undefined,
      overscan: undefined,
      rows: undefined,
      rowHeight: 36,
      rowKey: 'id' as any,
      threshold: 80,
      watchWidth: undefined,
      ui: {
        rowClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // VirtualScrollerVertical
  virtualScrollerVertical: {
    props: {
      rows: undefined,
      rowHeight: 36,
      rowKey: 'id' as any,
      virtualizerOptions: {
        overscan: 5,
      },
      ui: {
        rowClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['virtualizerOptions', 'ui'],
  },

  // YearMonthSelector
  yearMonthSelector: {
    props: {
      stackLabel: true,
      ui: {
        appendClass: ({ defaults }) => defaults.all,
        pickerIconClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // YearSelector
  yearSelector: {
    props: {
      modelValue: undefined,
      referenceTarget: undefined,
      ui: {
        containerClass: ({ defaults }) => defaults.all,
        previousBtnClass: ({ defaults }) => defaults.all,
        nextBtnClass: ({ defaults }) => defaults.all,
        menuContainerClass: ({ defaults }) => defaults.all,
        yearBtnClass: ({ defaults }) => defaults.all,
      },
    },
    merge: ['ui'],
  },

  // Misc
  misc: {
    uiState: {
      general: {
        keyboardShortcuts: false,
      },
      table: {
        fit: 'fit-with-header',
        autoSaveSchema: true,
      },
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
  button: IConfigItem<IBtnProps>
  dialog: IConfigItem<IDialogProps>
  form: IConfigItem<IFormProps> & {
    confirmationInit?: { enabled?: boolean, required?: boolean, editable?: boolean }
  }
  menu: IConfigItem<IMenuProps>
  breadcrumbs: IConfigItem<IBreadcrumbsProps> & {
    misc?: { useLastBreadcrumbAsTitle?: boolean }
    home: {
      icon?: string
      path?: string | (() => string)
      label?: string | (() => string | undefined)
      component?: string
    }
  }
  buttonGroup: IConfigItem<IButtonGroupProps>
  checkbox: IConfigItem<ICheckboxProps>
  circleProgress: IConfigItem<ICircleProgressProps>
  chip: IConfigItem<IChipProps>
  collapse: IConfigItem<ICollapseProps>
  colorInput: IConfigItem<IColorInputProps>
  confirmation: IConfigItem<IConfirmationProps>
  crudBtns: IConfigItem<ICrudBtnsProps>
  crudEditBtn: IConfigItem<ICrudEditBtnProps>
  currencyInput: IConfigItem<ICurrencyInputProps>
  dateInput: IConfigItem<IDateInputProps>
  datePicker: IConfigItem<IDatePickerProps>
  drawer: IConfigItem<IDrawerProps>
  durationInput: IConfigItem<IDurationInputProps>
  field: IConfigItem<IFieldProps>
  fieldWithFormatter: IConfigItem<IFieldWithFormatterProps>
  fileInput: IConfigItem<IFileInputProps>
  fileInputSimple: IConfigItem<IFileInputProps>
  heading: IConfigItem<IHeadingProps>
  iconInput: IConfigItem<IIconInputProps>
  inputLabel: IConfigItem<IInputLabelProps>
  inputWrapper: IConfigItem<IInputWrapperProps>
  item: IConfigItem<IItemProps>
  list: IConfigItem<IListProps>
  loader: IConfigItem<ILoaderProps>
  menuConfirmation: IConfigItem<IMenuConfirmationProps>
  menuProxy: IConfigItem<IMenuProxyProps>
  miniCard: IConfigItem<IMiniCardProps>
  monthSelector: IConfigItem<IMonthSelectorProps>
  monthSelectorGrid: IConfigItem<IMonthSelectorGridProps>
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
  elementMovement: IConfigItem<IElementMovementProps>
  horizontalScroller: IConfigItem<IHorizontalScrollerProps>
  verticalScroller: IConfigItem<IVerticalScrollerProps>
  scrollArea: IConfigItem<IScrollAreaProps>
  searchInput: IConfigItem<ITextInputProps>
  section: IConfigItem<ISectionProps>
  selector: IConfigItem<ISelectorProps>
  separator: IConfigItem<ISeparatorProps>
  skeleton: IConfigItem<ISkeletonProps>
  mainBar: IConfigItem<IMainBarProps>
  keyboardShortcut: IConfigItem<IKeyboardShortcutProps>
  table: IConfigItem<ITableProps>
  tabs: IConfigItem<ITabsProps>
  tab: IConfigItem<ITabProps>
  textArea: IConfigItem<ITextAreaInputProps>
  textInput: IConfigItem<ITextInputProps>
  timeInput: IConfigItem<ITimeInputProps>
  toggle: IConfigItem<IToggleProps>
  tooltip: IConfigItem<ITooltipProps>
  tree: IConfigItem<ITreeProps>
  valueFormatter: IConfigItem<IValueFormatterProps>
  virtualScroller: IConfigItem<IVirtualScrollerProps<any>>
  virtualScrollerVertical: IConfigItem<IVirtualScrollerVerticalProps<any>>
  yearMonthSelector: IConfigItem<IYearMonthSelectorProps>
  yearSelector: IConfigItem<IYearSelectorProps>

  misc: {
    uiState?: Partial<IUIState>
  }
}

export function extendUIConfig<T extends Partial<IUIConfig> & IItem>(config: T): T {
  return config
}

export default extendUIConfig(defaultComponentsConfig)
