export type IBannerProps = {
  /**
   * The number in top right corner on the `Banner`
   */
  counter?: number

  /**
   * Whether the `Banner` should be dismissed on click
   */
  dismissable?: boolean

  /**
   * Whether the icon should be centered with the text
   */
  iconCenter?: boolean

  /**
   * The icon class
   */
  iconClass?: ClassType

  /**
   * The label of the `Banner`
   */
  label?: string

  /**
   * Whether the `Banner` is visible
   */
  modelValue?: boolean

  /**
   * Whether the `Banner` should have the appear transition
   */
  noTransition?: boolean

  /**
   * Whether the `Banner` is "outlined" ~ with a border and dimmed background
   */
  outlined?: boolean

  /**
   * Type of the `Banner`
   */
  variant?: 'error' | 'info' | 'success' | 'warning'
}
