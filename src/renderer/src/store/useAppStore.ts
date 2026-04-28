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

interface AppState {
  articles: Article[]
  currentArticleId: number | null
  currentArticleTitle: string
  editorContent: string
  currentThemeId: string
  currentTheme: Theme | null
  editorInstance: Editor | null
  configuredProviders: ConfiguredProvider[]
  setArticles: (articles: Article[]) => void
  setCurrentArticleId: (id: number | null) => void
  setCurrentArticleTitle: (title: string) => void
  setEditorContent: (html: string) => void
  setCurrentThemeId: (id: string) => void
  setCurrentTheme: (theme: Theme) => void
  setEditorInstance: (editor: Editor | null) => void
  setConfiguredProviders: (providers: ConfiguredProvider[]) => void
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
      setArticles: (articles) => set({ articles }),
      setCurrentArticleId: (id) => set({ currentArticleId: id }),
      setCurrentArticleTitle: (title) => set({ currentArticleTitle: title }),
      setEditorContent: (html) => set({ editorContent: html }),
      setCurrentThemeId: (id) => set({ currentThemeId: id }),
      setCurrentTheme: (theme) => set({ currentTheme: theme }),
      setEditorInstance: (editor) => set({ editorInstance: editor }),
      setConfiguredProviders: (providers) => set({ configuredProviders: providers }),
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
