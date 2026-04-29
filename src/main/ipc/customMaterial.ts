import { ipcMain, dialog, BrowserWindow } from 'electron'
import {
  listCustomMaterials,
  saveCustomMaterial,
  deleteCustomMaterial,
  incrementMaterialUse,
  updateCustomMaterialMeta,
  updateCustomMaterialHtml,
  duplicateCustomMaterial,
  listCustomMaterialGroups,
  createCustomMaterialGroup,
  renameCustomMaterialGroup,
  deleteCustomMaterialGroup,
  reorderCustomMaterialGroups,
  moveMaterialToGroup,
} from '../db'

export function registerCustomMaterialHandlers(): void {
  // ── Materials ──

  ipcMain.handle('cm:list', () => {
    const materials = listCustomMaterials()
    const groups = listCustomMaterialGroups()
    return { materials, groups }
  })

  ipcMain.handle('cm:save', (_e, material: {
    id?: string
    name: string
    kind: string
    keywords: string[]
    thumbnail: string
    html: string
    group_id?: string | null
  }) => {
    return saveCustomMaterial(material)
  })

  ipcMain.handle('cm:delete', (_e, id: string) => {
    return deleteCustomMaterial(id)
  })

  ipcMain.handle('cm:incrementUse', (_e, id: string) => {
    incrementMaterialUse(id)
  })

  ipcMain.handle('cm:updateMeta', (_e, id: string, data: { name?: string; keywords?: string[]; group_id?: string | null }) => {
    return updateCustomMaterialMeta(id, data)
  })

  ipcMain.handle('cm:updateHtml', (_e, id: string, html: string, thumbnail: string) => {
    return updateCustomMaterialHtml(id, html, thumbnail)
  })

  ipcMain.handle('cm:duplicate', (_e, id: string) => {
    return duplicateCustomMaterial(id)
  })

  ipcMain.handle('cm:moveToGroup', (_e, materialId: string, groupId: string | null) => {
    return moveMaterialToGroup(materialId, groupId)
  })

  // ── Groups ──

  ipcMain.handle('cm:createGroup', (_e, name: string) => {
    return createCustomMaterialGroup(name)
  })

  ipcMain.handle('cm:renameGroup', (_e, id: string, newName: string) => {
    return renameCustomMaterialGroup(id, newName)
  })

  ipcMain.handle('cm:deleteGroup', (_e, id: string, alsoDeleteMaterials: boolean) => {
    deleteCustomMaterialGroup(id, alsoDeleteMaterials)
  })

  ipcMain.handle('cm:reorderGroups', (_e, ids: string[]) => {
    reorderCustomMaterialGroups(ids)
  })

  // ── Import / Export ──

  ipcMain.handle('cm:exportAll', () => {
    const materials = listCustomMaterials()
    const groups = listCustomMaterialGroups()
    return {
      version: 1,
      exportedAt: Date.now(),
      groups: groups.map((g) => ({
        id: g.id,
        name: g.name,
        sortOrder: g.sort_order,
      })),
      materials: materials.map((m) => ({
        id: m.id,
        name: m.name,
        kind: m.kind,
        keywords: JSON.parse(m.keywords || '[]'),
        thumbnail: m.thumbnail,
        html: m.html,
        groupId: m.group_id,
        createdAt: m.created_at * 1000,
        updatedAt: m.updated_at * 1000,
        useCount: m.use_count,
      })),
    }
  })

  ipcMain.handle('cm:exportToFile', async () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return { canceled: true }

    const data = await ipcMain.emit('cm:exportAll')
    // 直接调用 list 函数
    const materials = listCustomMaterials()
    const groups = listCustomMaterialGroups()
    const exportData = {
      version: 1,
      exportedAt: Date.now(),
      groups: groups.map((g) => ({
        id: g.id,
        name: g.name,
        sortOrder: g.sort_order,
      })),
      materials: materials.map((m) => ({
        id: m.id,
        name: m.name,
        kind: m.kind,
        keywords: JSON.parse(m.keywords || '[]'),
        thumbnail: m.thumbnail,
        html: m.html,
        groupId: m.group_id,
        createdAt: m.created_at * 1000,
        updatedAt: m.updated_at * 1000,
        useCount: m.use_count,
      })),
    }

    const date = new Date().toISOString().slice(0, 10)
    const result = await dialog.showSaveDialog(win, {
      title: '导出自定义素材',
      defaultPath: `custom-materials-${date}.json`,
      filters: [{ name: 'JSON 文件', extensions: ['json'] }],
    })

    if (result.canceled || !result.filePath) return { canceled: true }

    const fs = await import('fs/promises')
    await fs.writeFile(result.filePath, JSON.stringify(exportData, null, 2), 'utf-8')
    return { canceled: false, path: result.filePath }
  })

  ipcMain.handle('cm:importFromFile', async () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return { canceled: true }

    const result = await dialog.showOpenDialog(win, {
      title: '导入自定义素材',
      filters: [{ name: 'JSON 文件', extensions: ['json'] }],
      properties: ['openFile'],
    })

    if (result.canceled || result.filePaths.length === 0) return { canceled: true }

    const fs = await import('fs/promises')
    const content = await fs.readFile(result.filePaths[0], 'utf-8')

    try {
      const data = JSON.parse(content)

      // 验证基本结构
      if (!data.version || !Array.isArray(data.materials)) {
        return { canceled: false, error: '文件格式无效：缺少 version 或 materials 字段' }
      }

      // 验证每个素材的必需字段
      for (const m of data.materials) {
        if (!m.name || !m.kind || !m.html) {
          return { canceled: false, error: `素材 "${m.name || '未知'}" 缺少必需字段（name/kind/html）` }
        }
        if (!['snippet', 'template', 'divider'].includes(m.kind)) {
          return { canceled: false, error: `素材 "${m.name}" 的 kind "${m.kind}" 无效` }
        }
      }

      return { canceled: false, data }
    } catch (err) {
      return { canceled: false, error: `JSON 解析失败：${(err as Error).message}` }
    }
  })

  ipcMain.handle('cm:import', (_e, data: any, conflictStrategy: 'skip' | 'overwrite' | 'new') => {
    const existing = listCustomMaterials()
    const existingIds = new Set(existing.map((m) => m.id))

    // 导入分组
    if (Array.isArray(data.groups)) {
      for (const g of data.groups) {
        if (!g.name) continue
        createCustomMaterialGroup(g.name)
      }
    }

    // 导入素材
    const imported = { added: 0, skipped: 0, overwritten: 0 }
    if (Array.isArray(data.materials)) {
      for (const m of data.materials) {
        if (existingIds.has(m.id)) {
          if (conflictStrategy === 'skip') {
            imported.skipped++
            continue
          } else if (conflictStrategy === 'new') {
            // 生成新 ID
            saveCustomMaterial({
              name: m.name,
              kind: m.kind,
              keywords: m.keywords || [],
              thumbnail: m.thumbnail || m.html,
              html: m.html,
              group_id: m.groupId || null,
            })
            imported.added++
            continue
          }
          // overwrite: 继续往下走 saveCustomMaterial 的 ON CONFLICT
          imported.overwritten++
        }

        saveCustomMaterial({
          id: m.id,
          name: m.name,
          kind: m.kind,
          keywords: m.keywords || [],
          thumbnail: m.thumbnail || m.html,
          html: m.html,
          group_id: m.groupId || null,
        })
        if (!existingIds.has(m.id)) {
          imported.added++
        }
      }
    }

    return imported
  })
}
