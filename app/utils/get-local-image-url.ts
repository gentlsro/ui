import { join } from 'pathe'

export function getLocalImageUrl(image?: string | null, options: { folder?: string } = {}) {
  const rC = useRuntimeConfig()
  const filesHost = rC.public.filesHost

  if (!image) {
    return undefined
  }

  const { folder = '' } = options

  return join(`${filesHost}/${folder}/${image}`)
}
