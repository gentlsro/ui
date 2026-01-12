import { uiConfig } from '$uiConfig'

export const useLayoutStore = defineStore('__layout', () => {
  // Layout
  const navigationHeight = ref(uiConfig.navigation.defaultNavigationHeight)

  const isDrawerOpen = ref({ left: false, right: false })
  const isDrawerMini = ref({ left: false, right: false })
  const drawerWidth = ref({
    left: uiConfig.pageDrawer.props.width,
    right: uiConfig.pageDrawer.props.width,
    leftMini: uiConfig.pageDrawer.props.miniWidth,
    rightMini: uiConfig.pageDrawer.props.miniWidth,
  })

  return {
    navigationHeight,
    isDrawerOpen,
    isDrawerMini,
    drawerWidth,
  }
})
