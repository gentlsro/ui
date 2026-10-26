export type RuntimeIcon = {
  name: string
  status: 'ready' | 'missing' | 'unavailable'
  mode?: 'mask' | 'background'
  url?: string
}

export type IconAsset = Required<Pick<RuntimeIcon, 'mode' | 'url'>>
