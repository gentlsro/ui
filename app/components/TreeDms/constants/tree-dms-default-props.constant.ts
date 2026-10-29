// @unocss-include

import type { ITreeDmsProps } from '../types/tree-dms-props.type'

export const TREE_DMS_DEFAULT_PROPS = {
  ui: {
    labelClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies Omit<Pick<ITreeDmsProps<any>, 'ui'>, 'ui'> & { ui: object }
