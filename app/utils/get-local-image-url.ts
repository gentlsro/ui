import { join } from 'pathe'

export function getLocalImageUrl(image?: string | null, options: { folder?: string } = {}) {
  const rC = useRuntimeConfig()
  const filesHost = rC.public.filesHost

  if (!image) {
    return undefined
  }

  if (/^https?:\/\//i.test(image) || image.startsWith('//')) {
    return image
  }

  const { folder = '' } = options

  return join(`${filesHost}/${folder}/${image}`)
}
