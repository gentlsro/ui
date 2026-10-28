import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'

/** Reusable UI accepts route targets without expanding the consuming app's route map. */
export type NavigationTarget = string | RouteLocationAsPathGeneric | RouteLocationAsRelativeGeneric
