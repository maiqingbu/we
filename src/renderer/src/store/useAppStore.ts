import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { themes } from '@/themes/presets'
import type { Editor } from '@tiptap/react'
import type { Theme } from '@/themes/types'

const VALID_THEME_IDS = new Set(themes.map((t) => t.id))

interface Article {
  id: number
  title: string
  content: string
  theme_id: string | null
  created_at: number
  updated_at: number
}

interface ConfiguredProvider {
  provider_id: string
}

export interface CustomMaterialItem {
  id: string
  name: string
  kind: string
  keywords: string[]
  thumbnail: string
  html: string
  group_id: string | null
  created_at: number
  updated_at: number
  use_count: number
}

export interface CustomMaterialGroupItem {
  id: string
  name: string
  sort_order: number
  created_at: number
}

interface AppState {
  articles: Article[]
  currentArticleId: number | null
  currentArticleTitle: string
  editorContent: string
  currentThemeId: string
  currentTheme: Theme | null
  editorInstance: Editor | null
  configuredProviders: ConfiguredProvider[]
  customMaterials: CustomMaterialItem[]
  customGroups: CustomMaterialGroupItem[]
  setArticles: (articles: Article[]) => void
  setCurrentArticleId: (id: number | null) => void
  setCurrentArticleTitle: (title: string) => void
  setEditorContent: (html: string) => void
  setCurrentThemeId: (id: string) => void
  setCurrentTheme: (theme: Theme) => void
  setEditorInstance: (editor: Editor | null) => void
  setConfiguredProviders: (providers: ConfiguredProvider[]) => void
  refreshCustomMaterials: () => Promise<void>
  saveCustomMaterial: (m: { id?: string; name: string; kind: string; keywords: string[]; thumbnail: string; html: string; group_id?: string | null }) => Promise<string>
  deleteCustomMaterial: (id: string) => Promise<void>
  incrementMaterialUse: (id: string) => void
}

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      articles: [],
      currentArticleId: null,
      currentArticleTitle: '',
      editorContent: '',
      currentThemeId: 'original',
      currentTheme: null,
      editorInstance: null,
      configuredProviders: [],
      customMaterials: [],
      customGroups: [],
      setArticles: (articles) => set({ articles }),
      setCurrentArticleId: (id) => set({ currentArticleId: id }),
      setCurrentArticleTitle: (title) => set({ currentArticleTitle: title }),
      setEditorContent: (html) => set({ editorContent: html }),
      setCurrentThemeId: (id) => set({ currentThemeId: id }),
      setCurrentTheme: (theme) => set({ currentTheme: theme }),
      setEditorInstance: (editor) => set({ editorInstance: editor }),
      setConfiguredProviders: (providers) => set({ configuredProviders: providers }),
      refreshCustomMaterials: async () => {
        try {
          const res = await window.api?.cmList()
          if (res) {
            const materials: CustomMaterialItem[] = res.materials.map((m: any) => ({
              ...m,
              keywords: JSON.parse(m.keywords || '[]'),
            }))
            const groups: CustomMaterialGroupItem[] = res.groups
            set({ customMaterials: materials, customGroups: groups })
          }
        } catch (err) {
          console.error('[custom-materials] Failed to load:', err)
        }
      },
      saveCustomMaterial: async (m) => {
        const res = await window.api?.cmSave(m)
        if (res) {
          // 刷新列表
          useAppStore.getState().refreshCustomMaterials()
          return res.id
        }
        return ''
      },
      deleteCustomMaterial: async (id) => {
        await window.api?.cmDelete(id)
        useAppStore.getState().refreshCustomMaterials()
      },
      incrementMaterialUse: (id) => {
        window.api?.cmIncrementUse(id)
        // 不需要立即刷新，下次打开面板时自然会刷新
      },
    }),
    {
      name: 'wx-typesetter-store',
      partialize: (state) => ({ currentThemeId: state.currentThemeId }),
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<AppState>) }
        // Migration: if stored themeId is no longer valid, fall back to 'original'
        // Custom theme IDs start with 'custom-' and are always valid
        if (merged.currentThemeId && !VALID_THEME_IDS.has(merged.currentThemeId) && !merged.currentThemeId.startsWith('custom-')) {
          merged.currentThemeId = 'original'
        }
        return merged
      },
    }
  )
)

export { useAppStore }
export type { Article, AppState }
