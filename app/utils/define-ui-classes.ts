import type {
  ApplyUIClassConfig,
  UIClassComponent,
  UIClassComposers,
  UIClassConfigBuilder,
  UIClassDefaults,
  UIClassesBefore,
  UILayerId,
} from '../types/ui-class-config.type'

/** Declares named class defaults independently of ordinary component props. */
export function defineUIClasses<Layer extends UILayerId>(
  _layer: Layer,
): <const Defaults extends UIClassDefaults<UIClassesBefore<Layer>>>(
  defaults: Defaults & Record<Exclude<keyof Defaults, UIClassComponent>, never>,
) => UIClassConfigBuilder<UIClassesBefore<Layer>, Defaults> {
  return <const Defaults extends UIClassDefaults<UIClassesBefore<Layer>>>(
    defaults: Defaults & Record<Exclude<keyof Defaults, UIClassComponent>, never>,
  ): UIClassConfigBuilder<UIClassesBefore<Layer>, Defaults> => ({
    classDefaults: defaults,
    compose<const Composers extends UIClassComposers<ApplyUIClassConfig<UIClassesBefore<Layer>, { classDefaults: Defaults }>>>(
      composers: Composers,
    ) {
      return { classDefaults: defaults, classComposition: composers }
    },
  })
}
