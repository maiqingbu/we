import { checkTypos, type TypoIssue } from './typoChecker'
import { checkSensitive, type SensitiveIssue } from './sensitiveChecker'
import { computeStats, type ArticleStats } from './statistics'

export interface LintResult {
  typos: TypoIssue[]
  sensitive: SensitiveIssue[]
  stats: ArticleStats
}

export interface LinkCheckResult {
  url: string
  ok: boolean
  status?: number
  error?: string
}

export type { TypoIssue, SensitiveIssue, ArticleStats }
export { checkTypos, checkSensitive, computeStats }
