// Types
import type { IMiniCardProps } from '../../Card/types/mini-card-props.type'
import type { IInputWrapperProps } from '../../InputWrapper/types/input-wrapper-props.type'

export type IInputBlockProps = IMiniCardProps & {
  editable?: boolean
  validation?: IInputWrapperProps['validation']
  name?: string
}
