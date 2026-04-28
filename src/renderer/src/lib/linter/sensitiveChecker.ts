import { sensitiveDictionary, type SensitiveRule } from './dictionaries/sensitive'

export interface SensitiveIssue {
  word: string
  level: 'high' | 'medium' | 'low'
  category: string
  suggestion: string
  start: number
  end: number
}

export async function checkSensitive(
  plainText: string,
  ignoreList: Set<string>
): Promise<SensitiveIssue[]> {
  const issues: SensitiveIssue[] = []

  // Load political sensitive words from JSON via dynamic import
  let politicalRules: SensitiveRule[] = []
  try {
    const mod = await import('./dictionaries/sensitive-political.json')
    politicalRules = (mod.default ?? mod) as SensitiveRule[]
  } catch {
    // JSON file not available, skip political rules
  }

  const allRules: SensitiveRule[] = [...sensitiveDictionary, ...politicalRules]

  for (const rule of allRules) {
    if (ignoreList.has(rule.word)) continue
    let index = 0
    while ((index = plainText.indexOf(rule.word, index)) !== -1) {
      issues.push({
        word: rule.word,
        level: rule.level,
        category: rule.category,
        suggestion: rule.suggestion ?? '',
        start: index,
        end: index + rule.word.length,
      })
      index += rule.word.length
    }
  }

  return issues
}
