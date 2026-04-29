import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    templateBlock: {
      insertTemplateBlock: (materialId: string, html: string) => ReturnType
    }
  }
}

export const TemplateBlock = Node.create({
  name: 'templateBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      html: {
        default: '',
        rendered: false, // 不渲染到 DOM 属性上，仅存储在 ProseMirror 节点中
      },
      materialId: { default: '' },
      rotation: { default: 0 },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'section[data-template-id]',
        getAttrs: (dom) => {
          const el = dom as HTMLElement
          return {
            materialId: el.getAttribute('data-template-id') || '',
            html: el.innerHTML || '',
            rotation: parseInt(el.getAttribute('data-rotation') || '0', 10) || 0,
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    // 将模板内容存储在 data-html 属性中，由预览端展开
    return [
      'section',
      mergeAttributes(HTMLAttributes, {
        'data-template-id': node.attrs.materialId || '',
        'data-material-id': node.attrs.materialId || '',
        'data-html': node.attrs.html || '',
        'data-rotation': String(node.attrs.rotation || 0),
      }),
    ]
  },

  addNodeView() {
    return ({ node, getPos, view }) => {
      const container = document.createElement('section')
      container.setAttribute('data-template-id', node.attrs.materialId || '')
      container.setAttribute('data-material-id', node.attrs.materialId || '')
      container.innerHTML = node.attrs.html

      container.contentEditable = 'false'
      container.style.cursor = 'default'
      container.style.position = 'relative'

      let overlay: HTMLDivElement | null = null

      // 应用图片旋转：图片跟随旋转，文字保持正向
      const applyRotation = (angle: number) => {
        const imgs = container.querySelectorAll('img')
        imgs.forEach((img) => {
          if (angle === 0) {
            img.style.transform = ''
            img.style.transformOrigin = ''
          } else {
            img.style.transform = `rotate(${angle}deg)`
            img.style.transformOrigin = 'center center'
          }
        })
        // 文字元素反向旋转，保持正向可读
        const textEls = container.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, li, td, th, div, a, em, strong, b, i, u, label')
        textEls.forEach((el) => {
          const htmlEl = el as HTMLElement
          // 跳过包含图片的容器（避免反向旋转图片的父元素）
          if (htmlEl.querySelector('img')) return
          if (htmlEl.tagName === 'IMG') return
          if (angle === 0) {
            htmlEl.style.transform = ''
          } else {
            htmlEl.style.transform = `rotate(${-angle}deg)`
          }
        })
      }

      // 初始化旋转
      applyRotation(node.attrs.rotation || 0)

      container.addEventListener('mouseenter', () => {
        if (!overlay) {
          container.style.outline = '2px dashed rgba(59, 130, 246, 0.3)'
          container.style.outlineOffset = '2px'
          container.style.borderRadius = '4px'
        }
      })
      container.addEventListener('mouseleave', () => {
        if (!overlay) {
          container.style.outline = 'none'
        }
      })

      const closeOverlay = () => {
        if (!overlay) return
        // 将编辑内容同步回 ProseMirror 节点
        const editedHtml = overlay.querySelector('[data-edit-area]')?.innerHTML || overlay.innerHTML
        const pos = getPos()
        if (pos != null) {
          const currentNode = view.state.doc.nodeAt(pos)
          if (currentNode && currentNode.attrs.html !== editedHtml) {
            const tr = view.state.tr
            tr.setNodeMarkup(pos, undefined, { ...currentNode.attrs, html: editedHtml })
            view.dispatch(tr)
          }
        }
        overlay.remove()
        overlay = null
        container.style.outline = 'none'
      }

      container.addEventListener('dblclick', (e) => {
        // If double-clicking an image, let ImageEditExtension handle it
        const target = e.target as HTMLElement
        if (target.tagName === 'IMG') {
          const src = target.getAttribute('src')
          if (src) {
            e.preventDefault()
            e.stopPropagation()
            window.dispatchEvent(new CustomEvent('image:edit', {
              detail: { src, element: target }
            }))
            return
          }
        }

        e.preventDefault()
        e.stopPropagation()
        if (overlay) return

        // 创建脱离 ProseMirror DOM 的浮层编辑器
        overlay = document.createElement('div')
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;'

        const editorBox = document.createElement('div')
        editorBox.style.cssText = 'background:#fff;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.2);max-width:800px;width:90%;max-height:80vh;overflow:auto;padding:24px;position:relative;'

        // 关闭按钮
        const closeBtn = document.createElement('button')
        closeBtn.textContent = '✕'
        closeBtn.style.cssText = 'position:absolute;top:8px;right:12px;background:none;border:none;font-size:18px;cursor:pointer;color:#666;z-index:1;'
        closeBtn.addEventListener('click', closeOverlay)
        editorBox.appendChild(closeBtn)

        // 可编辑内容区
        const editArea = document.createElement('div')
        editArea.setAttribute('data-edit-area', '')
        editArea.contentEditable = 'true'
        editArea.innerHTML = node.attrs.html
        editArea.style.cssText = 'outline:none;min-height:100px;padding-top:24px;'
        editorBox.appendChild(editArea)

        overlay.appendChild(editorBox)
        document.body.appendChild(overlay)

        // 点击遮罩层关闭
        overlay.addEventListener('mousedown', (evt) => {
          if (evt.target === overlay) closeOverlay()
        })

        // Escape 关闭
        const onKeydown = (evt: KeyboardEvent) => {
          if (evt.key === 'Escape') {
            closeOverlay()
            document.removeEventListener('keydown', onKeydown)
          }
        }
        document.addEventListener('keydown', onKeydown)

        editArea.focus()
      })

      // 右键菜单：旋转控制
      let ctxMenu: HTMLDivElement | null = null
      const removeCtxMenu = () => {
        if (ctxMenu) { ctxMenu.remove(); ctxMenu = null }
      }

      container.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        e.stopPropagation()
        removeCtxMenu()

        ctxMenu = document.createElement('div')
        ctxMenu.style.cssText = 'position:fixed;z-index:99999;background:#1e1e1e;border:1px solid #444;border-radius:8px;padding:8px;box-shadow:0 4px 16px rgba(0,0,0,0.3);min-width:160px;'
        ctxMenu.style.left = `${e.clientX}px`
        ctxMenu.style.top = `${e.clientY}px`

        const title = document.createElement('div')
        title.textContent = '图片旋转'
        title.style.cssText = 'font-size:12px;color:#aaa;padding:4px 8px;margin-bottom:4px;'
        ctxMenu.appendChild(title)

        const currentRotation = node.attrs.rotation || 0

        const angles = [
          { label: '↺ 逆时针 90°', delta: -90 },
          { label: '↻ 顺时针 90°', delta: 90 },
          { label: '↩ 旋转 180°', delta: 180 },
        ]

        angles.forEach(({ label, delta }) => {
          const btn = document.createElement('button')
          btn.textContent = label
          btn.style.cssText = 'display:block;width:100%;text-align:left;padding:6px 12px;border:none;background:transparent;color:#eee;font-size:13px;cursor:pointer;border-radius:4px;'
          btn.addEventListener('mouseenter', () => { btn.style.background = '#444' })
          btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent' })
          btn.addEventListener('click', () => {
            const pos = getPos()
            if (pos != null) {
              const currentNode = view.state.doc.nodeAt(pos)
              if (currentNode) {
                const newAngle = ((currentNode.attrs.rotation || 0) + delta) % 360
                const tr = view.state.tr
                tr.setNodeMarkup(pos, undefined, { ...currentNode.attrs, rotation: newAngle === 0 ? 0 : newAngle })
                view.dispatch(tr)
              }
            }
            removeCtxMenu()
          })
          ctxMenu!.appendChild(btn)
        })

        // 重置按钮
        if (currentRotation !== 0) {
          const resetBtn = document.createElement('button')
          resetBtn.textContent = '重置'
          resetBtn.style.cssText = 'display:block;width:100%;text-align:left;padding:6px 12px;border:none;background:transparent;color:#eee;font-size:13px;cursor:pointer;border-radius:4px;'
          resetBtn.addEventListener('mouseenter', () => { resetBtn.style.background = '#444' })
          resetBtn.addEventListener('mouseleave', () => { resetBtn.style.background = 'transparent' })
          resetBtn.addEventListener('click', () => {
            const pos = getPos()
            if (pos != null) {
              const currentNode = view.state.doc.nodeAt(pos)
              if (currentNode) {
                const tr = view.state.tr
                tr.setNodeMarkup(pos, undefined, { ...currentNode.attrs, rotation: 0 })
                view.dispatch(tr)
              }
            }
            removeCtxMenu()
          })
          ctxMenu!.appendChild(resetBtn)
        }

        // 自定义角度滑块
        const sliderWrap = document.createElement('div')
        sliderWrap.style.cssText = 'padding:8px;border-top:1px solid #444;margin-top:4px;'
        const sliderLabel = document.createElement('div')
        sliderLabel.textContent = `自定义角度: ${currentRotation}°`
        sliderLabel.style.cssText = 'font-size:11px;color:#888;margin-bottom:4px;'
        sliderWrap.appendChild(sliderLabel)

        const slider = document.createElement('input')
        slider.type = 'range'
        slider.min = '-180'
        slider.max = '180'
        slider.value = String(currentRotation)
        slider.style.cssText = 'width:100%;accent-color:#3b82f6;'
        slider.addEventListener('input', () => {
          const val = parseInt(slider.value, 10)
          sliderLabel.textContent = `自定义角度: ${val}°`
          const pos = getPos()
          if (pos != null) {
            const currentNode = view.state.doc.nodeAt(pos)
            if (currentNode) {
              const tr = view.state.tr
              tr.setNodeMarkup(pos, undefined, { ...currentNode.attrs, rotation: val })
              view.dispatch(tr)
            }
          }
        })
        sliderWrap.appendChild(slider)
        ctxMenu.appendChild(sliderWrap)

        document.body.appendChild(ctxMenu)

        // 点击外部关闭
        const onDocClick = () => { removeCtxMenu(); document.removeEventListener('mousedown', onDocClick) }
        setTimeout(() => document.addEventListener('mousedown', onDocClick), 0)
      })

      return {
        dom: container,
        stopEvent() {
          // 浮层编辑时，事件在 body 级别处理，不需要拦截
          return false
        },
        update(updatedNode) {
          if (
            updatedNode.attrs.html !== node.attrs.html ||
            updatedNode.attrs.materialId !== node.attrs.materialId ||
            updatedNode.attrs.rotation !== node.attrs.rotation
          ) {
            container.innerHTML = updatedNode.attrs.html
            container.setAttribute('data-material-id', updatedNode.attrs.materialId || '')
            container.setAttribute('data-template-id', updatedNode.attrs.materialId || '')
            node = updatedNode
            applyRotation(updatedNode.attrs.rotation || 0)
          }
          return true
        },
        destroy() {
          if (overlay) overlay.remove()
          removeCtxMenu()
        },
      }
    }
  },

  addCommands() {
    return {
      insertTemplateBlock:
        (materialId, html) =>
        ({ tr, state, dispatch }) => {
          const node = state.schema.nodes.templateBlock.create({ html, materialId })
          if (dispatch) {
            tr.replaceSelectionWith(node)
          }
          return true
        },
    }
  },
})

