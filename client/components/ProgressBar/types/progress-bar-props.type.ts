export type IProgressBarProps = {
  /**
   * The progress of the progress bar
   */
  progress?: number

  /**
   * The label of the progress bar
   */
  label: string | ((progress?: number) => string) | false
}
