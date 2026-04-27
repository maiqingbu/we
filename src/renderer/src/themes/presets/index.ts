import { originalTheme } from './original'
import { defaultTheme } from './default'
import { elegantTheme } from './elegant'
import { techTheme } from './tech'
import type { Theme } from '../types'

export const themes: Theme[] = [originalTheme, defaultTheme, elegantTheme, techTheme]

export function getThemeById(id: string): Theme {
  return themes.find((t) => t.id === id) ?? originalTheme
}
