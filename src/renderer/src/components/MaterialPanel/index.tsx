import { useState, useMemo, useEffect, useCallback, Component, type ReactNode, type ErrorInfo } from 'react'
import { DOMSerializer } from 'prosemirror-model'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useAppStore, type CustomMaterialItem, type CustomMaterialGroupItem } from '@/store/useAppStore'
import { allMaterials, searchMaterials, getMaterialsByKind, getAllFestivals } from '@/lib/materials/registry'
import { getUpcomingFestivals } from '@/lib/festivals'
import { COLUMN_PRESETS, getPresetsByGroup } from '@/lib/materials/columns'
import type { ColumnPreset } from '@/lib/materials/columns'
import type { Material, MaterialVariant } from '@/lib/materials/types'
import { SaveMaterialDialog } from './SaveMaterialDialog'

type TabType = 'divider' | 'template' | 'columns' | 'festival' | 'svg' | 'custom'

// ErrorBoundary 防止子组件崩溃导致整个应用白屏
class MaterialErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  state = { hasError: false, error: undefined as Error | undefined }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[MaterialPanel] Render error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-sm text-red-500 mb-2">素材面板渲染出错</div>
            <div className="text-xs text-muted-foreground mb-3">{this.state.error?.message}</div>
            <button
              className="text-xs text-primary hover:underline cursor-pointer"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              重试
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function MaterialPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<TabType>('divider')
  const [variantPicker, setVariantPicker] = useState<Material | null>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [selectedHtml, setSelectedHtml] = useState('')
  const [contextMenuId, setContextMenuId] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<{ added: number; skipped: number; overwritten: number } | null>(null)
  const [cachedSelectionHtml, setCachedSelectionHtml] = useState('')

  const editor = useAppStore((s) => s.editorInstance)
  const customMaterials = useAppStore((s) => s.customMaterials)
  const customGroups = useAppStore((s) => s.customGroups)
  const refreshCustomMaterials = useAppStore((s) => s.refreshCustomMaterials)
  const deleteCustomMaterial = useAppStore((s) => s.deleteCustomMaterial)
  const incrementMaterialUse = useAppStore((s) => s.incrementMaterialUse)

  // 打开面板时刷新自定义素材 + 缓存当前选区
  useEffect(() => {
    if (open) {
      refreshCustomMaterials()
      setContextMenuId(null)
      setImportResult(null)
      // 缓存当前编辑器选区 HTML（用 ProseMirror 序列化，保留自定义节点结构）
      if (editor) {
        const { empty, from, to } = editor.state.selection
        if (!empty) {
          try {
            const fragment = editor.state.doc.slice(from, to).content
            const serializer = DOMSerializer.fromSchema(editor.state.schema)
            const wrap = document.createElement('div')
            fragment.forEach((node) => {
              wrap.appendChild(serializer.serializeNode(node))
            })
            setCachedSelectionHtml(wrap.innerHTML)
          } catch {
            setCachedSelectionHtml('')
          }
        } else {
          setCachedSelectionHtml('')
        }
      }
    }
  }, [open, refreshCustomMaterials, editor])

  // 内置素材过滤
  const builtinFiltered = useMemo(() => {
    if (tab === 'custom' || tab === 'columns') return []
    let items = search ? searchMaterials(search) : allMaterials
    return items.filter((m) => m.kind === tab)
  }, [search, tab])

  // 图文混排预设过滤
  const columnsFiltered = useMemo(() => {
    if (tab !== 'columns') return []
    if (search) {
      const q = search.toLowerCase()
      return COLUMN_PRESETS.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q))
      )
    }
    return COLUMN_PRESETS
  }, [search, tab])

  // 图文混排按分组
  const columnsGrouped = useMemo(() => {
    const groups: Record<string, ColumnPreset[]> = {}
    for (const p of columnsFiltered) {
      if (!groups[p.group]) groups[p.group] = []
      groups[p.group].push(p)
    }
    return groups
  }, [columnsFiltered])

  // 自定义素材过滤（支持搜索）
  const customFiltered = useMemo(() => {
    if (tab !== 'custom') return []
    let items = customMaterials
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((m) =>
        m.name.toLowerCase().includes(q) ||
        m.keywords.some((k) => k.toLowerCase().includes(q))
      )
    }
    return items
  }, [search, tab, customMaterials])

  const handleInsert = (material: Material, variant?: MaterialVariant) => {
    if (!editor) return
    const html = variant ? variant.html : material.html
    editor.commands.insertTemplateBlock(material.id, html)
    setVariantPicker(null)
    onOpenChange(false)
  }

  const handleInsertCustom = (item: CustomMaterialItem) => {
    if (!editor) return
    try {
      if (item.kind === 'template') {
        editor.commands.insertTemplateBlock(item.id, item.html)
      } else {
        // snippet / divider / columns: 通过 ProseMirror 解析器插入，自动还原节点结构
        editor.chain().focus().insertContent(item.html).run()
      }
      incrementMaterialUse(item.id)
      onOpenChange(false)
    } catch (err) {
      console.error('[MaterialPanel] Insert failed:', err)
      alert('插入素材失败：内容格式可能不兼容')
    }
  }

  const handleCardClick = (material: Material) => {
    if (material.variants && material.variants.length > 0) {
      setVariantPicker(material)
    } else {
      handleInsert(material)
    }
  }

  // 从编辑器选区保存（使用缓存的选区 HTML，因为点击按钮时编辑器已失焦）
  const handleSaveFromSelection = () => {
    if (!cachedSelectionHtml) {
      alert('请先在编辑器中选中要保存的内容')
      return
    }
    setSelectedHtml(cachedSelectionHtml)
    setSaveDialogOpen(true)
  }

  // 自定义素材操作
  const handleDuplicate = async (id: string) => {
    const res = await window.api?.cmDuplicate(id)
    if (res) {
      await refreshCustomMaterials()
    }
    setContextMenuId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个素材吗？')) return
    await deleteCustomMaterial(id)
    setContextMenuId(null)
  }

  const handleMoveToGroup = async (materialId: string, groupId: string | null) => {
    await window.api?.cmMoveToGroup(materialId, groupId)
    await refreshCustomMaterials()
    setContextMenuId(null)
  }

  const handleExport = async () => {
    const res = await window.api?.cmExportToFile()
    if (res && !res.canceled) {
      alert(`已导出到：${res.path}`)
    }
  }

  const handleImport = async () => {
    const res = await window.api?.cmImportFromFile()
    if (res.canceled || res.error) {
      if (res.error) alert(res.error)
      return
    }
    if (res.data) {
      const existing = customMaterials
      const existingIds = new Set(existing.map((m) => m.id))
      const conflictCount = res.data.materials.filter((m: any) => existingIds.has(m.id)).length

      let strategy: 'skip' | 'overwrite' | 'new' = 'skip'
      if (conflictCount > 0) {
        const input = prompt(
          `文件包含 ${res.data.materials.length} 个素材，其中 ${conflictCount} 个 ID 已存在。\n\n请输入冲突处理策略：\n1 = 跳过已存在的\n2 = 覆盖已存在的\n3 = 全部作为新素材导入`,
          '1'
        )
        if (input === '2') strategy = 'overwrite'
        else if (input === '3') strategy = 'new'
        else if (input === null) return
      }

      const result = await window.api?.cmImport(res.data, strategy)
      setImportResult(result)
      await refreshCustomMaterials()
    }
  }

  // 按分组 key 归类（内置素材）
  const builtinGrouped = useMemo(() => {
    const groups: Record<string, Material[]> = {}
    for (const m of builtinFiltered) {
      const key = m.kind === 'festival' && m.festival ? m.festival.name : m.category
      if (!groups[key]) groups[key] = []
      groups[key].push(m)
    }
    return groups
  }, [builtinFiltered])

  // 自定义素材按分组归类
  const customGrouped = useMemo(() => {
    const groups: Record<string, CustomMaterialItem[]> = {}
    for (const m of customFiltered) {
      const key = m.group_id || '__ungrouped__'
      if (!groups[key]) groups[key] = []
      groups[key].push(m)
    }
    return groups
  }, [customFiltered])

  const categoryLabels: Record<string, string> = {
    'divider-minimal': '极简',
    'divider-pattern': '图案',
    'divider-gradient': '渐变',
    'divider-decoration': '装饰',
    'template-info': '信息盒',
    'template-quote': '引用卡',
    'template-highlight': '高亮',
    'template-cta': 'CTA 按钮',
    'template-qrcode': '二维码',
    'template-author': '作者卡',
    'template-follow': '关注引导',
    'template-end': '文章封底',
    'template-qa': '问答',
    'template-compare': '对比',
    'template-steps': '步骤',
    'template-stats': '数据',
    'template-key-points': '要点',
    'template-warning': '警告',
    'template-testimonial': '评价',
    'template-list': '列表',
    'template-toc': '目录',
    'svg-decor': '装饰',
    'svg-icon': '图标',
    'svg-badge': '徽章',
  }

  const tabLabels: Record<TabType, string> = {
    divider: '分割线',
    template: '模板',
    columns: '图文混排',
    festival: '节日',
    svg: 'SVG素材',
    custom: '我的',
  }

  const getGroupName = (groupId: string): string => {
    if (groupId === '__ungrouped__') return '未分组'
    return customGroups.find((g) => g.id === groupId)?.name || '未分组'
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => { if (!v) setVariantPicker(null); onOpenChange(v) }}>
        <SheetContent side="right" className="w-[420px] p-0 flex flex-col">
          <MaterialErrorBoundary>
          <SheetHeader className="px-4 pt-4 pb-2">
            <SheetTitle>素材库</SheetTitle>
          </SheetHeader>

          {/* Search */}
          <div className="px-4 pb-2">
            <input
              type="text"
              placeholder="搜索素材..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border px-4">
            {(['divider', 'template', 'columns', 'festival', 'svg', 'custom'] as TabType[]).map((t) => (
              <button
                key={t}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  tab === t
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setTab(t)}
              >
                {tabLabels[t]}
              </button>
            ))}
          </div>

          {/* 节日智能推荐横条 */}
          {(() => {
            const upcoming = getUpcomingFestivals(getAllFestivals())
            if (upcoming.length === 0) return null
            const f = upcoming[0]
            return (
              <div
                className="mx-4 mt-2 flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: `${f.color}10`, border: `1px solid ${f.color}30` }}
                onClick={() => setTab('festival')}
              >
                <span className="text-base">{f.icon}</span>
                <span className="text-xs font-medium" style={{ color: f.color }}>
                  {f.name}{f.daysLeft === 0 ? ' 今天' : ` 还有${f.daysLeft}天`}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">点击查看素材 →</span>
              </div>
            )
          })()}

          {/* Custom Tab Actions */}
          {tab === 'custom' && (
            <div className="px-4 py-2 flex gap-2 border-b border-border">
              <button
                onClick={handleSaveFromSelection}
                className="flex-1 h-7 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 cursor-pointer"
              >
                + 从当前选区保存
              </button>
              <button
                onClick={handleImport}
                className="h-7 px-2 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                title="导入"
              >
                📥
              </button>
              <button
                onClick={handleExport}
                className="h-7 px-2 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                title="导出"
              >
                📤
              </button>
            </div>
          )}

          {/* Import result toast */}
          {importResult && (
            <div className="mx-4 mt-2 rounded-md bg-green-50 border border-green-200 px-3 py-1.5 text-xs text-green-700">
              导入完成：新增 {importResult.added}，跳过 {importResult.skipped}，覆盖 {importResult.overwritten}
              <button onClick={() => setImportResult(null)} className="ml-2 text-green-500 hover:text-green-700 cursor-pointer">✕</button>
            </div>
          )}

          {/* Variant Picker Overlay */}
          {variantPicker && (
            <div className="absolute inset-0 z-10 bg-background/95 backdrop-blur-sm flex flex-col">
              <div className="px-4 pt-4 pb-2 flex items-center gap-3">
                <button
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => setVariantPicker(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <h3 className="text-sm font-semibold">{variantPicker.name} - 选择样式</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-3">
                  {variantPicker.variants!.map((variant) => (
                    <button
                      key={variant.id}
                      className="rounded-lg border border-border p-2 text-left hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => handleInsert(variantPicker, variant)}
                    >
                      <div
                        className="rounded bg-muted/50 p-2 mb-1.5 overflow-hidden"
                        style={{ minHeight: '48px' }}
                        dangerouslySetInnerHTML={{ __html: variant.html }}
                      />
                      <div className="text-xs font-medium truncate">{variant.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Material Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {tab === 'columns' ? (
              /* 图文混排预设 */
              columnsFiltered.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-sm text-muted-foreground">没有找到匹配的布局</div>
                </div>
              ) : (
                Object.entries(columnsGrouped).map(([groupKey, presets]) => (
                  <div key={groupKey} className="mb-6">
                    <div className="text-xs font-medium mb-2 text-muted-foreground">{groupKey} ({presets.length})</div>
                    <div className="grid grid-cols-2 gap-2">
                      {presets.map((preset) => (
                        <button
                          key={preset.id}
                          className="rounded-lg border border-border p-2 text-left hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => {
                            if (!editor) return
                            editor.commands.insertColumns(preset.layout, preset.widths, preset.defaultContent)
                            onOpenChange(false)
                          }}
                        >
                          <div
                            className="rounded bg-muted/50 p-2 mb-1.5 overflow-hidden"
                            style={{ minHeight: '48px' }}
                            dangerouslySetInnerHTML={{ __html: preset.thumbnail }}
                          />
                          <div className="text-xs font-medium truncate">{preset.name}</div>
                          <div className="text-[10px] text-muted-foreground">{preset.icon}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )
            ) : tab === 'custom' ? (
              /* 自定义素材 */
              customFiltered.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-3xl mb-3">📌</div>
                  <div className="text-sm text-muted-foreground mb-1">还没有自定义素材</div>
                  <div className="text-xs text-muted-foreground mb-3">
                    选中编辑器中的内容，右键 → 保存为素材
                  </div>
                  <button
                    onClick={handleImport}
                    className="text-xs text-primary hover:underline cursor-pointer"
                  >
                    或从 JSON 导入
                  </button>
                </div>
              ) : (
                Object.entries(customGrouped).map(([groupKey, items]) => (
                  <div key={groupKey} className="mb-6">
                    <div className="text-xs font-medium mb-2 text-muted-foreground">
                      {getGroupName(groupKey)} ({items.length})
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="relative rounded-lg border border-border p-2 text-left hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer group"
                          onClick={() => handleInsertCustom(item)}
                        >
                          {/* 操作按钮 */}
                          <button
                            className="absolute top-1 right-1 w-5 h-5 rounded flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent cursor-pointer z-10"
                            onClick={(e) => {
                              e.stopPropagation()
                              setContextMenuId(contextMenuId === item.id ? null : item.id)
                            }}
                          >
                            ⋯
                          </button>

                          {/* Context dropdown */}
                          {contextMenuId === item.id && (
                            <div
                              className="absolute top-6 right-1 z-20 bg-popover border border-border rounded-md shadow-md py-1 min-w-[120px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent cursor-pointer"
                                onClick={() => {
                                  setContextMenuId(null)
                                  setSelectedHtml(item.html)
                                  // 复用 SaveMaterialDialog 作为编辑
                                  setSaveDialogOpen(true)
                                }}
                              >
                                编辑
                              </button>
                              <button
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent cursor-pointer"
                                onClick={() => handleDuplicate(item.id)}
                              >
                                复制
                              </button>
                              <div className="border-t border-border my-1" />
                              <button
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent cursor-pointer"
                                onClick={() => handleMoveToGroup(item.id, null)}
                              >
                                移到未分组
                              </button>
                              {customGroups.map((g) => (
                                <button
                                  key={g.id}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent cursor-pointer"
                                  onClick={() => handleMoveToGroup(item.id, g.id)}
                                >
                                  移到「{g.name}」
                                </button>
                              ))}
                              <div className="border-t border-border my-1" />
                              <button
                                className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 cursor-pointer"
                                onClick={() => handleDelete(item.id)}
                              >
                                删除
                              </button>
                            </div>
                          )}

                          <div
                            className="rounded bg-muted/50 p-2 mb-1.5 overflow-hidden"
                            style={{ minHeight: '48px' }}
                            dangerouslySetInnerHTML={{ __html: item.thumbnail || '<span style="color:#999;font-size:12px;">预览不可用</span>' }}
                          />
                          <div className="text-xs font-medium truncate">{item.name}</div>
                          <div className="text-[10px] text-muted-foreground">用过 {item.use_count} 次</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )
            ) : (
              /* 内置素材 */
              Object.entries(builtinGrouped).map(([groupKey, items]) => {
                const firstFestival = items[0]?.festival
                const isFestivalGroup = !!firstFestival
                const groupLabel = isFestivalGroup
                  ? `${firstFestival.icon} ${firstFestival.name}`
                  : (categoryLabels[groupKey] || groupKey)

                return (
                  <div key={groupKey} className="mb-6">
                    <div className={`text-xs font-medium mb-2 ${isFestivalGroup ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {groupLabel}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((material) => (
                        <button
                          key={material.id}
                          className="rounded-lg border border-border p-2 text-left hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => handleCardClick(material)}
                        >
                          <div
                            className="rounded bg-muted/50 p-2 mb-1.5 overflow-hidden"
                            style={{ minHeight: '48px' }}
                            dangerouslySetInnerHTML={{ __html: material.thumbnail }}
                          />
                          <div className="text-xs font-medium truncate">{material.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })
            )}

            {tab !== 'custom' && builtinFiltered.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                没有找到匹配的素材
              </div>
            )}
          </div>
          </MaterialErrorBoundary>
        </SheetContent>
      </Sheet>

      {/* Save Material Dialog */}
      <SaveMaterialDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        selectedHtml={selectedHtml}
      />
    </>
  )
}

export { MaterialPanel }
