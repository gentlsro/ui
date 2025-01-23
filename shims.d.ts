/* eslint-disable ts/consistent-type-definitions */
import { PageMeta } from 'nuxt/schema'

declare module '#app' {
  interface PageMeta {
    isPageScrollable?: boolean
  }
}
export default {}
