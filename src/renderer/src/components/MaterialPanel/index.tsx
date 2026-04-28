import { useState, useMemo } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useAppStore } from '@/store/useAppStore'
import { allMaterials, searchMaterials } from '@/lib/materials/registry'
import type { Material, MaterialVariant } from '@/lib/materials/types'

type TabType = 'divider' | 'template'

function MaterialPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<TabType>('divider')
  const [variantPicker, setVariantPicker] = useState<Material | null>(null)
  const editor = useAppStore((s) => s.editorInstance)

  const filtered = useMemo(() => {
    let items = search ? searchMaterials(search) : allMaterials
    return items.filter((m) => m.kind === tab)
  }, [search, tab])

  const handleInsert = (material: Material, variant?: MaterialVariant) => {
    if (!editor) return
    const html = variant ? variant.html : material.html
    editor.commands.insertTemplateBlock(material.id, html)
    setVariantPicker(null)
    onOpenChange(false)
  }

  const handleCardClick = (material: Material) => {
    if (material.variants && material.variants.length > 0) {
      setVariantPicker(material)
    } else {
      handleInsert(material)
    }
  }

  // Group by category for section headers
  const grouped = useMemo(() => {
    const groups: Record<string, Material[]> = {}
    for (const m of filtered) {
      if (!groups[m.category]) groups[m.category] = []
      groups[m.category].push(m)
    }
    return groups
  }, [filtered])

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
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) setVariantPicker(null); onOpenChange(v) }}>
      <SheetContent side="right" className="w-[420px] p-0 flex flex-col">
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
          {(['divider', 'template'] as TabType[]).map((t) => (
            <button
              key={t}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTab(t)}
            >
              {t === 'divider' ? '分割线' : '模板'}
            </button>
          ))}
        </div>

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
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-6">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                {categoryLabels[category] || category}
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
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              没有找到匹配的素材
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { MaterialPanel }
