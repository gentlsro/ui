/* eslint-disable ts/consistent-type-definitions */
import { PageMeta } from 'nuxt/schema'

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
