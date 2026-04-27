import { createContext, useContext, useMemo } from 'react'
import type { Theme } from './types'
import { getThemeById } from './presets'

interface ThemeContextValue {
  theme: Theme
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: getThemeById('default'),
})

function ThemeProvider({
  themeId,
  children,
}: {
  themeId: string
  children: React.ReactNode
}): React.JSX.Element {
  const theme = useMemo(() => getThemeById(themeId), [themeId])
  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}

export { ThemeProvider, useTheme }
