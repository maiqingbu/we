import { useState, useEffect } from 'react'
import { useAppStore, type CustomMaterialGroupItem } from '@/store/useAppStore'
import { selectionToMaterialData, detectMaterialKind, generateThumbnail } from '@/lib/materials/custom/converter'
import type { CustomMaterialKind } from '@/lib/materials/types'

interface SaveMaterialDialogProps {
  open: boolean
  onClose: () => void
  /** 预填充的 HTML（来自编辑器选区） */
  selectedHtml?: string
  /** 编辑模式：传入已有素材 ID */
  editId?: string
}

function SaveMaterialDialog({ open, onClose, selectedHtml = '', editId }: SaveMaterialDialogProps) {
  const [name, setName] = useState('')
  const [keywordsStr, setKeywordsStr] = useState('')
  const [groupId, setGroupId] = useState<string | null>(null)
  const [kind, setKind] = useState<CustomMaterialKind>('snippet')
  const [previewHtml, setPreviewHtml] = useState('')
  const [saving, setSaving] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)

  const customGroups = useAppStore((s) => s.customGroups)
  const saveCustomMaterial = useAppStore((s) => s.saveCustomMaterial)
  const customMaterials = useAppStore((s) => s.customMaterials)
  const refreshCustomMaterials = useAppStore((s) => s.refreshCustomMaterials)

  // 初始化
  useEffect(() => {
    if (!open) return

    if (editId) {
      // 编辑模式：加载已有素材
      const existing = customMaterials.find((m) => m.id === editId)
      if (existing) {
        setName(existing.name)
        setKeywordsStr(existing.keywords.join(', '))
        setGroupId(existing.group_id)
        setKind(existing.kind as CustomMaterialKind)
        setPreviewHtml(existing.html)
      }
    } else if (selectedHtml) {
      // 新建模式：自动检测类型
      const detected = detectMaterialKind(selectedHtml)
      setKind(detected)
      setPreviewHtml(selectedHtml)
      setName('')
      setKeywordsStr('')
      setGroupId(null)
    }

    setNewGroupName('')
    setShowNewGroup(false)
  }, [open, editId, selectedHtml, customMaterials])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)

    try {
      let html = previewHtml
      let thumbnail = ''

      if (!editId && selectedHtml) {
        // 新建：用 converter 处理
        const data = selectionToMaterialData(selectedHtml, name.trim(), keywordsStr.split(/[,，]/).map((s) => s.trim()).filter(Boolean))
        html = data.html
        thumbnail = data.thumbnail
        setKind(data.kind)
      } else {
        // 编辑：用现有 HTML 生成缩略图
        thumbnail = generateThumbnail(html)
      }

      await saveCustomMaterial({
        id: editId,
        name: name.trim(),
        kind,
        keywords: keywordsStr.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
        thumbnail,
        html,
        group_id: groupId,
      })

      onClose()
    } catch (err) {
      console.error('[SaveMaterialDialog] Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return
    try {
      const res = await window.api?.cmCreateGroup(newGroupName.trim())
      if (res) {
        await refreshCustomMaterials()
        setGroupId(res.id)
        setNewGroupName('')
        setShowNewGroup(false)
      }
    } catch (err) {
      console.error('[SaveMaterialDialog] Create group failed:', err)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-lg border border-border w-[480px] max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">{editId ? '编辑素材' : '保存为自定义素材'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Preview */}
        <div className="px-5 pt-4">
          <div className="text-xs text-muted-foreground mb-1.5">预览</div>
          <div className="rounded-md border border-border bg-muted/30 p-3 min-h-[60px] max-h-[120px] overflow-hidden">
            <div
              className="preview-container"
              style={{ transform: 'scale(0.6)', transformOrigin: 'top left', width: '166.67%' }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-3">
          {/* Name */}
          <div>
            <label className="text-xs text-muted-foreground">名称 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="给素材起个名字"
              className="mt-1 w-full h-8 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="text-xs text-muted-foreground">关键词</label>
            <input
              type="text"
              value={keywordsStr}
              onChange={(e) => setKeywordsStr(e.target.value)}
              placeholder="用逗号分隔，如：开篇, 问候"
              className="mt-1 w-full h-8 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Group */}
          <div>
            <label className="text-xs text-muted-foreground">分组</label>
            <div className="mt-1 flex gap-2">
              <select
                value={groupId || ''}
                onChange={(e) => setGroupId(e.target.value || null)}
                className="flex-1 h-8 rounded-md border border-border bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">未分组</option>
                {customGroups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <button
                onClick={() => setShowNewGroup(!showNewGroup)}
                className="h-8 px-2 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 cursor-pointer"
              >
                + 新建
              </button>
            </div>
            {showNewGroup && (
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="分组名称"
                  className="flex-1 h-7 rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                />
                <button
                  onClick={handleCreateGroup}
                  className="h-7 px-2 rounded-md bg-primary text-primary-foreground text-xs hover:bg-primary/90 cursor-pointer"
                >
                  创建
                </button>
              </div>
            )}
          </div>

          {/* Kind */}
          {!editId && (
            <div>
              <label className="text-xs text-muted-foreground">类型</label>
              <div className="mt-1.5 space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="kind"
                    checked={kind === 'snippet'}
                    onChange={() => setKind('snippet')}
                    className="accent-primary"
                  />
                  <span className="text-sm">自由插入（可继续编辑）</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="kind"
                    checked={kind === 'template'}
                    onChange={() => setKind('template')}
                    className="accent-primary"
                  />
                  <span className="text-sm">锁定样式（仅文字可改）</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-border">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-md border border-border text-sm hover:bg-accent cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
          >
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}

export { SaveMaterialDialog }
