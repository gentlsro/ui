/* eslint-disable ts/consistent-type-definitions */
import { PageMeta } from 'nuxt/schema'

interface ImportMetaEnv {
  readonly NUXT_PUBLIC_THEME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '#app' {
  interface PageMeta {
    isPageScrollable?: boolean
  }
}

declare module '*?worker' {
  const WorkerFactory: {
    new (): Worker
  }

  export default WorkerFactory
}

export default {}
