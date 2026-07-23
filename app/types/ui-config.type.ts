import type { IUIState } from './ui-state.type'

// Component types
import type { IBadgeProps } from '../components/Badge/types/badge-props.type'
import type { IBannerProps } from '../components/Banner/types/banner-props.type'
import type { IBreadcrumbsProps } from '../components/Breadcrumbs/types/breadcrumbs-props.type'
import type { IBurgerProps } from '../components/Burger/types/burger-props.type'
import type { IBtnProps } from '../components/Button/types/btn-props.type'
import type { IButtonGroupProps } from '../components/ButtonGroup/types/button-group-props.type'
import type { ICheckboxProps } from '../components/Checkbox/types/checkbox-props.type'
import type { IChipProps } from '../components/Chip/types/chip-props.type'
import type { ICircleProgressProps } from '../components/CircleProgress/types/circle-progress-props.type'
import type { ICollapseProps } from '../components/Collapse/types/collapse-props.type'
import type { IColorInputProps } from '../components/Inputs/ColorInput/types/color-props.type'
import type { IConfirmationProps } from '../components/Confirmation/types/confirmation-props.type'
import type { ICrudBtnsProps, ICrudEditBtnProps } from '../components/Crud/types/crud-btn-props.type'
import type { ICurrencyInputProps } from '../components/Inputs/CurrencyInput/types/currency-input-props.type'
import type { IDateInputProps } from '../components/Inputs/DateInput/types/date-input-props.type'
import type { IDatePickerProps } from '../components/DatePicker/types/datepicker-props.type'
import type { IDialogProps } from '../components/Dialog/types/dialog-props.type'
import type { IDrawerProps } from '../components/Drawer/types/drawer-props.type'
import type { IDurationInputProps } from '../components/Inputs/DurationInput/types/duration-input-props.type'
import type { IElementMovementProps } from '../components/ElementMovement/types/element-movement-props.type'
import type { IFieldProps } from '../components/Field/types/field-props.type'
import type { IFieldWithFormatterProps } from '../components/Field/types/field-with-formatter.type'
import type { IFileInputProps } from '../components/Inputs/FileInput/types/file-input-props.type'
import type { IFormProps } from '../components/Form/types/form-props.type'
import type { IHeadingProps } from '../components/Typography/types/heading-props.type'
import type { IHorizontalScrollerProps, IVerticalScrollerProps } from '../components/Scroller/types/scroller-props.type'
import type { IIconInputProps } from '../components/Inputs/IconInput/types/icon-input-props.type'
import type { IInputLabelProps } from '../components/InputLabel/types/input-label-props.type'
import type { IInputWrapperProps } from '../components/InputWrapper/types/input-wrapper-props.type'
import type { IItemProps } from '../components/Item/types/item-props.type'
import type { IKeyboardShortcutProps } from '../components/KeyboardShortcut/types/keyboard-shortcut-props.type'
import type { IListProps } from '../components/List/types/list-props.type'
import type { ILoaderProps } from '../components/Loader/types/loader-props.type'
import type { IMainBarProps } from '../components/MainBar/types/main-bar-props.type'
import type { IMarqueeProps } from '../components/Marquee/types/marquee-props.type'
import type { IMenuConfirmationProps } from '../components/MenuConfirmation/types/menu-confirmation-props.type'
import type { IMenuProps } from '../components/Menu/types/menu-props.type'
import type { IMenuProxyProps } from '../components/MenuProxy/types/menu-proxy-props.type'
import type { IMiniCardProps } from '../components/Card/types/mini-card-props.type'
import type { IMonthSelectorGridProps } from '../components/MonthSelector/types/month-selector-grid-props.type'
import type { IMonthSelectorProps } from '../components/MonthSelector/types/month-selector-props.type'
import type { INavigationProps } from '../components/Navigation/types/navigation-props.type'
import type { INotificationRowProps } from '../components/Notification/types/notification-row-props.type'
import type { INotificationsProps } from '../components/Notification/types/notifications-props.type'
import type { INumberInputProps } from '../components/Inputs/NumberInput/types/number-input-props.type'
import type { IPageDrawerProps } from '../components/Page/types/page-drawer-props.type'
import type { IPageTitleProps } from '../components/Page/types/page-title-props.type'
import type { IPageWrapperProps } from '../components/Page/types/page-wrapper-props.type'
import type { IPivotProps } from '../components/Pivot/types/pivot-props.type'
import type { IProgressBarProps } from '../components/ProgressBar/types/progress-bar-props.type'
import type { IQueryBuilderProps } from '../components/QueryBuilder/types/query-builder-props.type'
import type { IRadioProps } from '../components/Radio/types/radio-props.type'
import type { IScrollAreaProps } from '../components/ScrollArea/types/scroll-area-props.type'
import type { ISectionProps } from '../components/Section/types/section-props.type'
import type { ISelectorProps } from '../components/Selector/types/selector-props.type'
import type { ISeparatorProps } from '../components/Separator/types/separator-props.type'
import type { ISkeletonProps } from '../components/Skeleton/types/skeleton-props.type'
import type { ITableProps } from '../components/Table/types/table-props.type'
import type { ITabProps } from '../components/Tabs/types/tab-props.type'
import type { ITabsProps } from '../components/Tabs/types/tabs-props.type'
import type { ITextAreaInputProps } from '../components/Inputs/TextArea/types/text-area-props.type'
import type { ITextInputProps } from '../components/Inputs/TextInput/types/text-input-props.type'
import type { ITimeInputProps } from '../components/Inputs/TimeInput/types/time-input-props.type'
import type { IToggleProps } from '../components/Toggle/types/toggle-props.type'
import type { ITooltipProps } from '../components/Tooltip/types/tooltip-props.type'
import type { ITreeProps } from '../components/Tree/types/tree-props.type'
import type { ITreeDmsProps } from '../components/TreeDms/types/tree-dms-props.type'
import type { IValueFormatterProps } from '../components/ValueFormatter/types/value-formatter-props.type'
import type { IVirtualScrollerProps } from '../components/VirtualScroller/types/virtual-scroller-props.type'
import type { IVirtualScrollerVerticalProps } from '../components/VirtualScroller/types/virtual-scroller-vertical-props.type'
import type { IYearMonthSelectorProps } from '../components/YearMonthSelector/types/year-month-selector-props.type'
import type { IYearSelectorProps } from '../components/YearSelector/types/year-selector-props.type'

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
  burger: IConfigItem<IBurgerProps>
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
  marquee: IConfigItem<IMarqueeProps>
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
  pivot: IConfigItem<IPivotProps>
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
  treeDms: IConfigItem<ITreeDmsProps<any>>
  valueFormatter: IConfigItem<IValueFormatterProps>
  virtualScroller: IConfigItem<IVirtualScrollerProps<any>>
  virtualScrollerVertical: IConfigItem<IVirtualScrollerVerticalProps<any>>
  yearMonthSelector: IConfigItem<IYearMonthSelectorProps>
  yearSelector: IConfigItem<IYearSelectorProps>

  misc: {
    uiState?: Partial<IUIState>
  }
}
