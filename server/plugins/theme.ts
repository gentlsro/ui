export default defineNitroPlugin(nitroApp => {
  // Set theme & lang
  nitroApp.hooks.hook('render:html', html => {
    html.head.push(`
      <script>
        (function () {
          const cookieByName = (document.cookie || '')
            .split(';')
            .reduce((agg, splitCookie) => {
              const [key, value] = splitCookie.split('=')

              if (!key || !value) {
                return agg
              }

              agg[key.trim()] = value.trim()

              return agg
            }, {})

          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          const setting = cookieByName.theme || (prefersDark ? 'dark' : 'light')
          // cookieByName.theme = setting

          document.documentElement.setAttribute('class', setting)
        })()
      </script>
    `)
  })
})
