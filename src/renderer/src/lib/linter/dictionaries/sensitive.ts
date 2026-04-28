export interface SensitiveRule {
  word: string
  level: 'high' | 'medium' | 'low'
  category: '政治' | '色情' | '广告' | '医疗' | '金融' | '极端用词'
  suggestion?: string
}

/**
 * 敏感词词典
 * 用于 wx-typesetter 内容校对系统
 * 主要覆盖广告法、医疗、金融、极端用词等场景
 */
export const sensitiveDictionary: SensitiveRule[] = [
  // ============================================================
  // 广告法极限用语 (~15 rules)
  // ============================================================
  {
    word: '最佳',
    level: 'high',
    category: '广告',
    suggestion: '建议改为"优秀""出色""优选"等',
  },
  {
    word: '最好',
    level: 'medium',
    category: '广告',
    suggestion: '建议改为"很好""优质"等',
  },
  {
    word: '第一',
    level: 'high',
    category: '广告',
    suggestion: '除非有权威数据支撑，否则建议改为"领先""前列"等',
  },
  {
    word: '唯一',
    level: 'high',
    category: '广告',
    suggestion: '建议改为"独特""独有"等',
  },
  {
    word: '顶级',
    level: 'high',
    category: '广告',
    suggestion: '建议改为"高端""优质"等',
  },
  {
    word: '国家级',
    level: 'high',
    category: '广告',
    suggestion: '除非有正式认证，否则建议删除或改为具体描述',
  },
  {
    word: '世界级',
    level: 'high',
    category: '广告',
    suggestion: '建议改为"国际知名""全球领先"等',
  },
  {
    word: '官方认证',
    level: 'medium',
    category: '广告',
    suggestion: '建议提供具体认证机构和编号',
  },
  {
    word: '永久',
    level: 'medium',
    category: '广告',
    suggestion: '建议改为"长期""持久"等',
  },
  {
    word: '绝无仅有',
    level: 'high',
    category: '广告',
    suggestion: '建议改为"罕见""难得"等',
  },
  {
    word: '万能',
    level: 'medium',
    category: '广告',
    suggestion: '建议改为"多功能""多用途"等',
  },
  {
    word: '首创',
    level: 'medium',
    category: '广告',
    suggestion: '除非有专利或权威证明，否则建议改为"创新""研发"等',
  },
  {
    word: '极品',
    level: 'high',
    category: '广告',
    suggestion: '建议改为"优质""精选"等',
  },
  {
    word: '史无前例',
    level: 'high',
    category: '广告',
    suggestion: '建议改为"前所未有""罕见"等',
  },
  {
    word: '100%',
    level: 'medium',
    category: '广告',
    suggestion: '建议改为具体数据来源或"极高"等',
  },

  // ============================================================
  // 医疗夸大用语 (~8 rules)
  // ============================================================
  {
    word: '根治',
    level: 'high',
    category: '医疗',
    suggestion: '建议改为"缓解""改善""辅助治疗"等',
  },
  {
    word: '治愈率',
    level: 'high',
    category: '医疗',
    suggestion: '建议提供权威临床数据来源',
  },
  {
    word: '药到病除',
    level: 'high',
    category: '医疗',
    suggestion: '属于医疗夸大用语，建议删除',
  },
  {
    word: '专治',
    level: 'high',
    category: '医疗',
    suggestion: '建议改为"适用于""针对"等',
  },
  {
    word: '包治',
    level: 'high',
    category: '医疗',
    suggestion: '属于医疗夸大用语，建议删除',
  },
  {
    word: '祖传秘方',
    level: 'high',
    category: '医疗',
    suggestion: '属于虚假宣传用语，建议删除',
  },
  {
    word: '纯天然无副作用',
    level: 'medium',
    category: '医疗',
    suggestion: '建议改为"天然成分""温和配方"等',
  },
  {
    word: '医疗级',
    level: 'medium',
    category: '医疗',
    suggestion: '除非有医疗器械认证，否则建议删除',
  },

  // ============================================================
  // 金融禁词 (~8 rules)
  // ============================================================
  {
    word: '稳赚',
    level: 'high',
    category: '金融',
    suggestion: '投资有风险，建议改为"稳健""有望"等',
  },
  {
    word: '保本',
    level: 'high',
    category: '金融',
    suggestion: '除非有明确合同保障，否则建议删除',
  },
  {
    word: '零风险',
    level: 'high',
    category: '金融',
    suggestion: '任何投资均有风险，建议删除此表述',
  },
  {
    word: '日收益',
    level: 'medium',
    category: '金融',
    suggestion: '建议改为"预期收益"并注明风险提示',
  },
  {
    word: '翻倍',
    level: 'high',
    category: '金融',
    suggestion: '属于收益承诺，建议删除或添加风险提示',
  },
  {
    word: '保收益',
    level: 'high',
    category: '金融',
    suggestion: '属于收益承诺，违反金融广告规范',
  },
  {
    word: '无风险',
    level: 'high',
    category: '金融',
    suggestion: '任何投资均有风险，建议删除此表述',
  },
  {
    word: '稳健收益',
    level: 'low',
    category: '金融',
    suggestion: '建议添加"投资有风险"等风险提示',
  },

  // ============================================================
  // 极端用词/标题党 (~8 rules)
  // ============================================================
  {
    word: '震惊',
    level: 'medium',
    category: '极端用词',
    suggestion: '建议使用更客观的标题描述',
  },
  {
    word: '速看',
    level: 'medium',
    category: '极端用词',
    suggestion: '建议使用更具体的标题描述',
  },
  {
    word: '紧急',
    level: 'medium',
    category: '极端用词',
    suggestion: '除非确有紧急事项，否则建议删除',
  },
  {
    word: '紧急通知',
    level: 'medium',
    category: '极端用词',
    suggestion: '建议改为"通知""公告"等',
  },
  {
    word: '不转不是中国人',
    level: 'high',
    category: '极端用词',
    suggestion: '属于道德绑架式标题党，建议删除',
  },
  {
    word: '罕见',
    level: 'low',
    category: '极端用词',
    suggestion: '建议提供具体数据或来源',
  },
  {
    word: '恐怖',
    level: 'medium',
    category: '极端用词',
    suggestion: '建议使用更准确的描述',
  },
  {
    word: '惊呆',
    level: 'medium',
    category: '极端用词',
    suggestion: '建议使用更客观的表述',
  },
]
