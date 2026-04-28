export const PROMPTS = {
  polish: {
    system: '你是一位中文写作编辑。任务是润色用户给的文本：让表达更清晰流畅，纠正语病，但保留原意和风格。直接输出润色后的文本，不要解释、不要加引号。',
    buildUser: (text: string) => text,
  },
  shorten: {
    system: '你是一位中文写作编辑。把用户的文本压缩到原长度的 60-70%，保留核心信息，直接输出，不要解释。',
    buildUser: (text: string) => text,
  },
  expand: {
    system: '你是一位中文写作编辑。把用户的文本扩展到原长度的 1.5-2 倍，添加细节和例证，保持原文风格，直接输出，不要解释。',
    buildUser: (text: string) => text,
  },
  restyle: {
    system: (style: string) => `你是一位中文写作编辑。把用户的文本改成${style}风格，保留原意，直接输出，不要解释。`,
    buildUser: (text: string) => text,
  },
  translate: {
    system: (targetLang: string) => `把用户的文本翻译成${targetLang}，直接输出译文，不要解释、不要加引号。`,
    buildUser: (text: string) => text,
  },
  custom: {
    system: '你是一位中文写作助手。按用户指令处理后续文本。直接输出结果，不要解释。',
    buildUser: (instruction: string, text: string) => `指令：${instruction}\n\n文本：\n${text}`,
  },
  title: {
    system: '你是一位资深公众号编辑，擅长写吸引人但不标题党的标题。根据用户给的文章内容，生成 5 个候选标题。\n输出严格 JSON 格式：{"titles": ["标题1", "标题2", ...]}\n要求：\n- 每个标题 12-25 字\n- 风格多样：1 个直白型、1 个悬念型、1 个数字型、1 个场景型、1 个对比型\n- 不要使用"震惊"、"速看"、"必看"这类标题党词汇',
    buildUser: (text: string) => text,
  },
  summary: {
    system: '你是公众号编辑。根据文章内容写一段 100-150 字的导语，要求：\n- 提炼文章核心观点\n- 引发读者继续阅读的欲望\n- 不要使用"本文"、"我们"等指代词\n- 直接输出导语，不要加引号或前缀',
    buildUser: (text: string) => text,
  },
  proofread: {
    system: '你是中文校对专家。检查用户文章中的错别字、语病、用词不当。\n输出严格 JSON 格式：\n{"issues": [{"text": "错的原文片段", "suggestion": "建议改为", "reason": "原因"}, ...]}\n要求：\n- 只报告确认的错误，不确定的不报\n- "原文片段"必须是原文中存在的连续字符串，不要改写\n- 最多报 20 个问题',
    buildUser: (text: string) => text,
  },
} as const

export type PromptKey = keyof typeof PROMPTS

export const RESTYLE_OPTIONS = [
  { id: 'professional', label: '专业' },
  { id: 'casual', label: '口语' },
  { id: 'humorous', label: '幽默' },
  { id: 'serious', label: '严肃' },
  { id: 'literary', label: '文艺' },
] as const

export const TRANSLATE_OPTIONS = [
  { id: 'english', label: '英文', lang: 'English' },
  { id: 'japanese', label: '日文', lang: '日本語' },
  { id: 'korean', label: '韩文', lang: '한국어' },
  { id: 'auto', label: '自动检测对译', lang: '与原文相同的语言' },
] as const

export const TITLE_TYPES = ['直白型', '悬念型', '数字型', '场景型', '对比型'] as const

export function truncateForAI(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen)
}

export function splitForLongArticle(text: string, mode: 'title' | 'summary' | 'proofread'): string[] {
  if (text.length <= 6000) return [text]

  if (mode === 'title') {
    // 首2000 + 末1000 + 中间随机1000
    const head = text.slice(0, 2000)
    const tail = text.slice(-1000)
    const midStart = Math.floor((text.length - 1000) / 2)
    const mid = text.slice(midStart, midStart + 1000)
    return [head + '\n...\n' + mid + '\n...\n' + tail]
  }

  if (mode === 'summary') {
    return [text.slice(0, 4000)]
  }

  // proofread: split into 3000-char chunks
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += 3000) {
    chunks.push(text.slice(i, i + 3000))
  }
  return chunks
}
