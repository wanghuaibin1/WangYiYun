
export type RGB = [number, number, number]

export const getThemeColor = (url: string): Promise<RGB> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const SIZE = 50
      const canvas = document.createElement('canvas')
      canvas.width = SIZE
      canvas.height = SIZE

      const ctx = canvas.getContext('2d')
      if (!ctx) return reject('Canvas error')

      ctx.drawImage(img, 0, 0, SIZE, SIZE)

      const data = ctx.getImageData(0, 0, SIZE, SIZE).data

      let r = 0, g = 0, b = 0
      const count = SIZE * SIZE

      for (let i = 0; i < data.length; i += 4) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
      }
      resolve([
        Math.round(r / count),
        Math.round(g / count),
        Math.round(b / count)
      ])
    }

    img.onerror = reject
    img.src = url
  })
}

export const normalizeThemeColor = (
  rgb: [number, number, number]
): [number, number, number] => {
  const luminance =
    0.2126 * rgb[0] +
    0.7152 * rgb[1] +
    0.0722 * rgb[2]

  const factor =
    luminance > 200 ? 0.45 :
      luminance > 160 ? 0.6 :
        luminance > 120 ? 0.75 :
          1

  return [
    Math.round(rgb[0] * factor),
    Math.round(rgb[1] * factor),
    Math.round(rgb[2] * factor)
  ]
}

