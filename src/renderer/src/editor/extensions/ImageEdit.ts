import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

/**
 * 图片编辑入口扩展
 * - 双击图片 → 打开编辑器
 * - hover 图片 → 显示编辑按钮
 */
export const ImageEditExtension = Extension.create({
  name: 'imageEdit',

  addProseMirrorPlugins(): Plugin[] {
    const pluginKey = new PluginKey('imageEdit')

    return [
      new Plugin({
        key: pluginKey,
        view: (editorView) => {
          ;(pluginKey as any)._view = editorView

          // Track which img is currently hovered
          let hoveredImg: HTMLElement | null = null

          const onMouseOver = (e: MouseEvent): void => {
            const target = e.target as HTMLElement
            if (target.tagName === 'IMG') {
              hoveredImg = target
              const next = target.nextElementSibling as HTMLElement | null
              if (next?.classList.contains('image-edit-hover-btn')) {
                next.style.opacity = '1'
                next.style.pointerEvents = 'auto'
              }
            } else if (target.closest('.image-edit-hover-btn')) {
              // Hovering over the button itself - keep it visible
              if (hoveredImg) {
                const next = hoveredImg.nextElementSibling as HTMLElement | null
                if (next?.classList.contains('image-edit-hover-btn')) {
                  next.style.opacity = '1'
                  next.style.pointerEvents = 'auto'
                }
              }
            }
          }

          const onMouseOut = (e: MouseEvent): void => {
            const target = e.target as HTMLElement
            const related = e.relatedTarget as HTMLElement | null

            // Only hide if actually leaving the img+button area
            if (target.tagName === 'IMG' || target.closest('.image-edit-hover-btn')) {
              // Check if moving to the button or staying in the img
              if (related?.closest('.image-edit-hover-btn') || related === hoveredImg) return

              if (hoveredImg) {
                const next = hoveredImg.nextElementSibling as HTMLElement | null
                if (next?.classList.contains('image-edit-hover-btn')) {
                  next.style.opacity = '0'
                  next.style.pointerEvents = 'none'
                }
              }
              if (target.tagName === 'IMG') hoveredImg = null
            }
          }

          editorView.dom.addEventListener('mouseover', onMouseOver)
          editorView.dom.addEventListener('mouseout', onMouseOut)

          return {
            destroy: () => {
              editorView.dom.removeEventListener('mouseover', onMouseOver)
              editorView.dom.removeEventListener('mouseout', onMouseOut)
              delete (pluginKey as any)._view
            },
          }
        },
        // dblclick 由 Editor.tsx 的 document 级别监听器统一处理，避免双重触发
        decorations(state) {
          const decorations: Decoration[] = []
          state.doc.descendants((node, pos) => {
            if (node.type.name === 'image') {
              const widget = Decoration.widget(
                pos + 1,
                () => {
                  // 容器
                  const container = document.createElement('div')
                  container.className = 'image-edit-hover-btn'
                  container.style.cssText = `
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                    z-index: 10;
                  `

                  // 阻止 ProseMirror 拦截按钮区域的鼠标事件
                  container.addEventListener('mousedown', (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  })

                  // 编辑按钮
                  const editBtn = document.createElement('button')
                  editBtn.innerHTML = '✏️'
                  editBtn.title = '编辑图片'
                  editBtn.style.cssText = `
                    width: 28px; height: 28px; border-radius: 6px;
                    background: rgba(0,0,0,0.6); color: white; border: none;
                    cursor: pointer; font-size: 14px;
                    display: flex; align-items: center; justify-content: center;
                  `
                  editBtn.addEventListener('click', (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const src = node.attrs.src
                    if (!src) return
                    let imgEl: HTMLElement | null = null
                    const view = (pluginKey as any)._view
                    if (view) {
                      const dom = view.nodeDOM(pos)
                      if (dom instanceof HTMLElement) {
                        imgEl = dom.tagName === 'IMG' ? dom : dom.querySelector('img')
                      }
                    }
                    window.dispatchEvent(
                      new CustomEvent('image:edit', {
                        detail: { src, element: imgEl },
                      })
                    )
                  })

                  // 替换按钮
                  const replaceBtn = document.createElement('button')
                  replaceBtn.innerHTML = '🔄'
                  replaceBtn.title = '替换图片'
                  replaceBtn.style.cssText = `
                    width: 28px; height: 28px; border-radius: 6px;
                    background: rgba(0,0,0,0.6); color: white; border: none;
                    cursor: pointer; font-size: 14px;
                    display: flex; align-items: center; justify-content: center;
                  `
                  replaceBtn.addEventListener('click', (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = () => {
                      const file = input.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = () => {
                        const newSrc = reader.result as string
                        const view = (pluginKey as any)._view
                        if (!view) return
                        const { tr } = view.state
                        tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: newSrc })
                        view.dispatch(tr)
                      }
                      reader.readAsDataURL(file)
                    }
                    input.click()
                  })

                  container.appendChild(editBtn)
                  container.appendChild(replaceBtn)
                  return container
                },
                { side: -1 }
              )
              decorations.push(widget)
            }
          })
          return DecorationSet.create(state.doc, decorations)
        },
      }),
    ]
  },
})
