import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { themes } from '@/themes/presets'

const VALID_THEME_IDS = new Set(themes.map((t) => t.id))

interface Article {
  id: number
  title: string
  content: string
  theme_id: string | null
  created_at: number
  updated_at: number
}

interface AppState {
  articles: Article[]
  currentArticleId: number | null
  currentArticleTitle: string
  editorContent: string
  currentThemeId: string
  setArticles: (articles: Article[]) => void
  setCurrentArticleId: (id: number | null) => void
  setCurrentArticleTitle: (title: string) => void
  setEditorContent: (html: string) => void
  setCurrentThemeId: (id: string) => void
}

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      articles: [],
      currentArticleId: null,
      currentArticleTitle: '',
      editorContent: '',
      currentThemeId: 'original',
      setArticles: (articles) => set({ articles }),
      setCurrentArticleId: (id) => set({ currentArticleId: id }),
      setCurrentArticleTitle: (title) => set({ currentArticleTitle: title }),
      setEditorContent: (html) => set({ editorContent: html }),
      setCurrentThemeId: (id) => set({ currentThemeId: id }),
    }),
    {
      name: 'wx-typesetter-store',
      partialize: (state) => ({ currentThemeId: state.currentThemeId }),
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<AppState>) }
        // Migration: if stored themeId is no longer valid, fall back to 'original'
        if (merged.currentThemeId && !VALID_THEME_IDS.has(merged.currentThemeId)) {
          merged.currentThemeId = 'original'
        }
        return merged
      },
    }
  )
)

export { useAppStore }
export type { Article, AppState }
