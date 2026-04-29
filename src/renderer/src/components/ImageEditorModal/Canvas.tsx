import React, { useEffect, useRef } from 'react'
import { Canvas as FabricCanvas, FabricImage } from 'fabric'

interface CanvasProps {
  imageUrl: string
  fabricRef: React.MutableRefObject<any>
  mainImageRef: React.MutableRefObject<any>
  onReady: (canvas: any, img: any) => void
}

const EditorCanvas: React.FC<CanvasProps> = ({ imageUrl, fabricRef, mainImageRef, onReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    const container = containerRef.current
    if (!canvasEl || !container) return

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    const fabricCanvas = new FabricCanvas(canvasEl, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: '#2a2a2a',
      selection: true,
    })

    fabricRef.current = fabricCanvas

    // 加载图片
    FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
      // 自动缩放到容器 90%，居中显示
      const scaleX = (containerWidth * 0.9) / (img.width || 1)
      const scaleY = (containerHeight * 0.9) / (img.height || 1)
      const scale = Math.min(scaleX, scaleY, 1)

      // 以中心为原点，旋转时围绕中心旋转，不会跳位
      img.set({
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
        left: containerWidth / 2,
        top: containerHeight / 2,
        selectable: false,
        evented: false,
      })

      // 自定义数据标记为主图
      ;(img as any).data = { type: 'mainImage' }

      fabricCanvas.add(img)
      fabricCanvas.renderAll()

      mainImageRef.current = img
      onReady(fabricCanvas, img)
    }).catch((err) => {
      console.error('[ImageEditor] 图片加载失败:', err)
    })

    return () => {
      fabricCanvas.dispose()
      fabricRef.current = null
      mainImageRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl])

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} />
    </div>
  )
}

export default EditorCanvas
