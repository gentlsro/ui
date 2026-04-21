import type { CSSProperties } from 'vue'

// Types
import type { IInputProps } from '../../types/input-props.type'

// Models
import type { FileModel } from '$utils'

export type IFileInputProps = {
  /**
   * The file types that are allowed to be selected
   */
  accept?: string

  /**
   * When provided, the file will be downloaded from this URL instead of forming
   * an URL based on defaults
   */
  downloadUrl?: string | ((file: IFile) => string)

  modelValue?: Array<File | IFile | FileModel> | null

  /**
   * Whether we can select multiple files
   */
  multi?: boolean

  /**
   * When true, `HorizontalScroller` will be used as the container
   *
   * NOTE: Applies only for `FileInputSimple` component
   */
  useScroller?: boolean

  /**
   * Is relevant only for `multi` and input-like mode
   */
  maxChipsRows?: number

  /**
   * Whether to hide the download button
   */
  noDownloadButton?: boolean

  /**
   * When true, the preview will not be shown, just an icon
   *
   * NOTE: Applies only for `FileInput` component
   */
  noPreview?: boolean

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the actual content inside the wrapper
     */
    innerClass?: ClassType

    /**
     * Style to apply to the actual content inside the wrapper
     */
    innerStyle?: CSSProperties

    /**
     * Class to apply to the chip
     */
    chipClass?: ClassType

    /**
     * Style to apply to the chip
     */
    chipStyle?: CSSProperties
  }
} & IInputProps
