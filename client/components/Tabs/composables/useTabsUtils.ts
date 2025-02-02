import type { App, VNode } from 'vue'

// Types
import type { ITabProps } from '../types/tab-props.type'
import { getComponentProps } from '../../../functions/get-component-props'

export type ITab = IItem & {
  id: string | number
  label?: string
}

export function useTabsUtils() {
  /**
   * This will recreate the `Tab` component but changes its name to be unique
   */
  function createTab(payload: {
    component: VNode
    name: string
    props: ITabProps
    vueApp: App
  }) {
    const { component, name, props, vueApp } = payload
    const mergedProps = { ...getComponentProps('tab'), ...props }

    const tabComponent = defineComponent({
      name,
      props: {
        name: { type: String, required: true },
        label: { type: [String, Function], required: false },
        icon: { type: String, required: false },
        btnProps: { type: Function, required: false },
      },
      setup(props) {
        return () => {
          const renderComponent = h(component, props)
          renderComponent.appContext = vueApp._context

          return renderComponent
        }
      },
    })

    return {
      id: name,
      name: props.name,
      component: tabComponent,
      props: mergedProps,
    }
  }

  return {
    createTab,
  }
}
