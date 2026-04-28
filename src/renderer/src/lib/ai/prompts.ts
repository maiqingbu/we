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
