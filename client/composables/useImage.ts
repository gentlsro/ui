export function useImages() {
  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const createImagePlaceholder = (
    b64ImgData: string,
  ): Promise<HTMLImageElement> => {
    return new Promise(resolve => {
      const imgPlaceholder = new Image()
      imgPlaceholder.src = b64ImgData

      imgPlaceholder.onload = () => resolve(imgPlaceholder)
    })
  }

  /**
   * @param {File} file ~ in image file
   * @param {number} h ~ desired height of the image
   * @returns data url of the image with the same aspect ratio but with defined height
   */
  const minimizeImg = async (file: File, h: number = 320) => {
    const b64ImgData = await readFile(file)
    const img = await createImagePlaceholder(b64ImgData)

    const newCanvas = document.createElement('canvas')
    let width = img.width
    let height = img.height

    if (height > h) {
      width = Math.round((width *= h / height))
      height = h
    }

    newCanvas.width = width
    newCanvas.height = height
    const newCanvasCtx = newCanvas.getContext('2d') as CanvasRenderingContext2D
    newCanvasCtx.drawImage(img, 0, 0, width, height)

    return newCanvas.toDataURL()
  }

  const getLocalImageUrl = (
    image?: string | null,
    options: { folder?: string } = {},
  ) => {
    if (!image) {
      return undefined
    }

    const filesHost = useRuntimeConfig().public.FILES_HOST ?? '/api/files'

    const { folder = '' } = options

    const folderPath = folder ? `${folder}/` : ''

    return `${filesHost}${folderPath}${image}`
  }

  const createFileFromCanvas = (
    canvas?: HTMLCanvasElement,
    fileName = 'file.png',
    mimeType = 'image/png',
  ): Promise<File | null> | undefined => {
    if (!canvas) {
      return undefined
    }

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        if (!blob) {
          resolve(null)
        } else {
          const file = new File([blob], fileName, { type: mimeType })
          resolve(file)
        }
      })
    })
  }

  return {
    createImagePlaceholder,
    minimizeImg,
    getLocalImageUrl,
    createFileFromCanvas,
  }
}
