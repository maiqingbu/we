import { originalTheme } from './original'
import { defaultTheme } from './default'
import { elegantTheme } from './elegant'
import { techTheme } from './tech'
import { wellnessTheme } from './wellness'
import { materiaMedicaTheme } from './materia-medica'
import { foodLabTheme } from './food-lab'
import { blueprintTheme } from './blueprint'
import { foldingSpaceTheme } from './folding-space'
import type { Theme } from '../types'

export const themes: Theme[] = [
  originalTheme,
  defaultTheme,
  elegantTheme,
  techTheme,
  wellnessTheme,
  materiaMedicaTheme,
  foodLabTheme,
  blueprintTheme,
  foldingSpaceTheme,
]

export function getThemeById(id: string): Theme {
  return themes.find((t) => t.id === id) ?? originalTheme
}
