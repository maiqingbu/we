import { typoDictionary, type TypoRule } from './dictionaries/typo'

export interface TypoIssue {
  word: string
  suggestion: string
  reason: string
  start: number
  end: number
  category: string
}

export function checkTypos(plainText: string, ignoreList: Set<string>): TypoIssue[] {
  const issues: TypoIssue[] = []
  for (const rule of typoDictionary) {
    if (ignoreList.has(rule.wrong)) continue
    let index = 0
    while ((index = plainText.indexOf(rule.wrong, index)) !== -1) {
      if (rule.context) {
        const slice = plainText.slice(Math.max(0, index - 10), index + rule.wrong.length + 10)
        if (!rule.context.test(slice)) {
          index += rule.wrong.length
          continue
        }
      }
      issues.push({
        word: rule.wrong,
        suggestion: rule.right,
        reason: rule.reason,
        start: index,
        end: index + rule.wrong.length,
        category: rule.category,
      })
      index += rule.wrong.length
    }
  }
  return issues
}
