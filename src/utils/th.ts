const ThemeColor = function (url:string) {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = function () {
      // 创建画布
      let w = 0; let h = 0
      if (this.width >= 2000) {
        w = this.width - 1500
      } else if (this.width >= 1500) {
        w = this.width - 1000
      } else if (this.width >= 1000) {
        w = this.width - 500
      } else {
        w = 500
      }
      if (this.height >= 2000) {
        h = this.height - 1500
      } else if (this.height >= 1500) {
        h = this.height - 1000
      } else if (this.height >= 1000) {
        h = this.height - 500
      } else {
        h = 500
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      // 绘制图片在画布上
      const context = canvas.getContext('2d')
      context.drawImage(this, 0, 0)
      // onload 内
      const pxArr = context.getImageData(0, 0, w, h).data
      // 平均像素
      const canvasSize = w * h
      let r = 0
      let g = 0
      let b = 0
      for (let i = 0, offset; i < canvasSize; i++) {
        offset = i * 4
        r += pxArr[offset + 0]
        g += pxArr[offset + 1]
        b += pxArr[offset + 2]
      }
      // 求取平均值
      r = Math.round(r / canvasSize)
      g = Math.round(g / canvasSize)
      b = Math.round(b / canvasSize)
      resolve([r, g, b])
    }
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}
export default ThemeColor
