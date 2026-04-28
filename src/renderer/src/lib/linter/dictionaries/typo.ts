export interface TypoRule {
  wrong: string
  right: string
  context?: RegExp
  reason: string
  category: 'confuse' | 'wrong-char' | 'wrong-word'
}

/**
 * 中文错别字/易混淆词词典
 * 用于 wx-typesetter 内容校对系统
 */
export const typoDictionary: TypoRule[] = [
  // ============================================================
  // 做/作 混淆 (~8 rules)
  // ============================================================
  {
    wrong: '做为',
    right: '作为',
    reason: '"作为"表示身份或充当某种角色，"做为"是常见误写',
    category: 'confuse',
  },
  {
    wrong: '做出了',
    right: '作出了',
    context: /作出(决定|贡献|规定|说明|解释|承诺|让步|判断|评价|指示)/,
    reason: '抽象名词前用"作出"，如"作出决定""作出贡献"',
    category: 'confuse',
  },
  {
    wrong: '作出了',
    right: '做出了',
    context: /做出(成绩|贡献|榜样|反应|样子|姿态|努力|牺牲|选择|让步)/,
    reason: '具体事物前用"做出"，如"做出成绩""做出榜样"',
    category: 'confuse',
  },
  {
    wrong: '作了',
    right: '做了',
    context: /做(了|完|好|出)(饭|菜|事|工|梦|题|手术|实验|检查|准备)/,
    reason: '表示具体动作时用"做"，如"做了饭""做了手术"',
    category: 'confuse',
  },
  {
    wrong: '做贡献',
    right: '作贡献',
    reason: '"贡献"是抽象名词，前面应用"作"',
    category: 'confuse',
  },
  {
    wrong: '做决定',
    right: '作决定',
    reason: '"决定"是抽象名词，前面应用"作"',
    category: 'confuse',
  },
  {
    wrong: '作法',
    right: '做法',
    context: /做法(正确|不对|简单|复杂|很好|不好|可行)/,
    reason: '表示具体的方法、方式时用"做法"',
    category: 'confuse',
  },
  {
    wrong: '做文章',
    right: '作文章',
    reason: '"作文章"比喻在某个问题上大做文章，属于固定用法',
    category: 'confuse',
  },

  // ============================================================
  // 的/得/地 (~5 rules)
  // ============================================================
  {
    wrong: '跑的快',
    right: '跑得快',
    reason: '动词后面接表示程度的补语时，应使用"得"而非"的"',
    category: 'confuse',
  },
  {
    wrong: '慢慢的',
    right: '慢慢地',
    context: /慢慢地(走|说|来|跑|吃|看|听|做|变|发展)/,
    reason: '修饰动词时应使用"地"（状语标志），而非"的"',
    category: 'confuse',
  },
  {
    wrong: '高兴的跳',
    right: '高兴地跳',
    reason: '修饰动词作状语时应用"地"，而非"的"',
    category: 'confuse',
  },
  {
    wrong: '说的对',
    right: '说得对',
    reason: '动词后接补充说明程度时用"得"',
    category: 'confuse',
  },
  {
    wrong: '认真的学',
    right: '认真地学',
    reason: '修饰动词作状语时应用"地"',
    category: 'confuse',
  },

  // ============================================================
  // 在/再 (~4 rules)
  // ============================================================
  {
    wrong: '在说一遍',
    right: '再说一遍',
    reason: '表示重复动作时用"再"，"在"表示存在或位置',
    category: 'confuse',
  },
  {
    wrong: '在见',
    right: '再见',
    reason: '"再见"是固定用语，表示告别，不能写成"在见"',
    category: 'confuse',
  },
  {
    wrong: '在次',
    right: '再次',
    reason: '表示又一次时用"再次"，"在次"是误写',
    category: 'confuse',
  },
  {
    wrong: '在来一次',
    right: '再来一次',
    reason: '表示重复动作时用"再"',
    category: 'confuse',
  },

  // ============================================================
  // 渡/度 (~4 rules)
  // ============================================================
  {
    wrong: '度过难关',
    right: '渡过难关',
    reason: '"渡过"用于比喻通过困难、危机等，"度过"用于时间',
    category: 'confuse',
  },
  {
    wrong: '渡过假期',
    right: '度过假期',
    reason: '"度过"用于时间，如假期、时光；"渡过"用于空间或困难',
    category: 'confuse',
  },
  {
    wrong: '度过难关',
    right: '渡过难关',
    reason: '难关不是时间概念，应使用"渡过"',
    category: 'confuse',
  },

  // ============================================================
  // 幅/副/付 (~4 rules)
  // ============================================================
  {
    wrong: '一副画',
    right: '一幅画',
    reason: '用于图画、布匹等平面事物时用"幅"',
    category: 'confuse',
  },
  {
    wrong: '一幅笑容',
    right: '一副笑容',
    reason: '用于面部表情时用"副"，如"一副笑脸""一副笑容"',
    category: 'confuse',
  },
  {
    wrong: '一幅对联',
    right: '一副对联',
    reason: '对联用"副"计量，不用"幅"',
    category: 'confuse',
  },
  // ============================================================
  // 即/既 (~4 rules)
  // ============================================================
  {
    wrong: '即然',
    right: '既然',
    reason: '"既然"表示已经如此，"即然"是常见误写',
    category: 'confuse',
  },
  {
    wrong: '既使',
    right: '即使',
    reason: '"即使"表示假设让步，"既使"是常见误写',
    category: 'confuse',
  },
  {
    wrong: '既便',
    right: '即便',
    reason: '"即便"表示假设让步，"既便"是常见误写',
    category: 'confuse',
  },
  {
    wrong: '即往不咎',
    right: '既往不咎',
    reason: '"既往不咎"意为对过去的事不再追究，"即"是误写',
    category: 'confuse',
  },

  // ============================================================
  // 截至/截止 (~3 rules)
  // ============================================================
  {
    wrong: '截止到',
    right: '截至',
    reason: '"截至"后面可以接时间，"截止"后面不能接宾语',
    category: 'confuse',
  },
  {
    wrong: '报名截止到',
    right: '报名截至',
    reason: '后面需要接具体时间时用"截至"，不用"截止到"',
    category: 'confuse',
  },

  // ============================================================
  // 高频成语错别字 (~30 rules)
  // ============================================================
  {
    wrong: '不径而走',
    right: '不胫而走',
    reason: '"胫"意为小腿，比喻消息传得快；"径"是小路，是误用',
    category: 'wrong-char',
  },
  {
    wrong: '迫不急待',
    right: '迫不及待',
    reason: '"及"意为来得及，"急"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '美仑美奂',
    right: '美轮美奂',
    reason: '"轮"指高大，形容建筑之美；"仑"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '走头无路',
    right: '走投无路',
    reason: '"投"意为投奔，"头"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '名符其实',
    right: '名副其实',
    reason: '"副"意为相符，"符"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '一愁莫展',
    right: '一筹莫展',
    reason: '"筹"意为计策、办法，"愁"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '兴高彩烈',
    right: '兴高采烈',
    reason: '"采"意为神采，"彩"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '穿流不息',
    right: '川流不息',
    reason: '"川"指河流，形容行人车马像水流一样连续不断',
    category: 'wrong-char',
  },
  {
    wrong: '按步就班',
    right: '按部就班',
    reason: '"部"指门类，"步"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '甘败下风',
    right: '甘拜下风',
    reason: '"拜"意为拜服、认输，"败"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '自抱自弃',
    right: '自暴自弃',
    reason: '"暴"意为糟蹋，"抱"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '针贬时弊',
    right: '针砭时弊',
    reason: '"砭"古代石针，引申为指出错误；"贬"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '一诺千斤',
    right: '一诺千金',
    reason: '"金"比喻贵重，"斤"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '默守成规',
    right: '墨守成规',
    reason: '"墨"指墨子，"默"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '金榜提名',
    right: '金榜题名',
    reason: '"题"意为写上名字，"提"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '世外桃园',
    right: '世外桃源',
    reason: '"源"指水源，出自陶渊明《桃花源记》；"园"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '谈笑风声',
    right: '谈笑风生',
    reason: '"生"意为产生，形容谈话时有说有笑；"声"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '鸠占雀巢',
    right: '鸠占鹊巢',
    reason: '"鹊"指喜鹊，"雀"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '竭泽而鱼',
    right: '竭泽而渔',
    reason: '"渔"意为捕鱼，"鱼"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '鼎立相助',
    right: '鼎力相助',
    reason: '"鼎力"意为大力，是敬辞；"立"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '再接再励',
    right: '再接再厉',
    reason: '"厉"同"砺"，意为磨砺；"励"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '黄梁美梦',
    right: '黄粱美梦',
    reason: '"粱"指小米，出自"黄粱一梦"；"梁"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '貌和神离',
    right: '貌合神离',
    reason: '"合"意为表面上凑合，"和"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '悬梁刺骨',
    right: '悬梁刺股',
    reason: '"股"指大腿，"骨"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '矫柔造作',
    right: '矫揉造作',
    reason: '"揉"意为使弯曲，"柔"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '鬼计多端',
    right: '诡计多端',
    reason: '"诡"意为欺诈，"鬼"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '既往不究',
    right: '既往不咎',
    reason: '"咎"意为责备，"究"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '一如继往',
    right: '一如既往',
    reason: '"既"意为已经，"继"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '相儒以沫',
    right: '相濡以沫',
    reason: '"濡"意为沾湿，"儒"是常见误写',
    category: 'wrong-char',
  },

  // ============================================================
  // 常见用字错误 (~15 rules)
  // ============================================================
  {
    wrong: '帐号',
    right: '账号',
    reason: '表示编号的账户用"账号"，"帐"用于帐篷、蚊帐等',
    category: 'wrong-char',
  },
  {
    wrong: '帐户',
    right: '账户',
    reason: '表示财务账户用"账户"，"帐"用于帐篷、蚊帐等',
    category: 'wrong-char',
  },
  {
    wrong: '凑和',
    right: '凑合',
    reason: '"凑合"是正确写法，表示将就、拼凑',
    category: 'wrong-char',
  },
  {
    wrong: '渲泄',
    right: '宣泄',
    reason: '"宣泄"意为排出（情绪），"渲"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '布署',
    right: '部署',
    reason: '"部署"是正确写法，"布"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '其它',
    right: '其他',
    reason: '指代事物时用"其他"，"其它"仅限指代非人事物且非常用',
    category: 'wrong-char',
  },
  {
    wrong: '想像',
    right: '想象',
    reason: '规范写法为"想象"，"像"取代了"象"',
    category: 'wrong-char',
  },
  {
    wrong: '成份',
    right: '成分',
    reason: '规范写法为"成分"，"分"取代了"份"',
    category: 'wrong-char',
  },
  {
    wrong: '份量',
    right: '分量',
    reason: '表示重量、程度时用"分量"，"份"是误写',
    category: 'wrong-char',
  },
  {
    wrong: '重迭',
    right: '重叠',
    reason: '规范写法为"重叠"，"迭"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '松驰',
    right: '松弛',
    reason: '"松弛"是正确写法，"驰"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '通迅',
    right: '通讯',
    reason: '"通讯"是正确写法，"迅"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '寒喧',
    right: '寒暄',
    reason: '"暄"意为温暖，"喧"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '冒然',
    right: '贸然',
    reason: '"贸然"意为轻率地，"冒"是常见误写',
    category: 'wrong-char',
  },

  // ============================================================
  // 技术术语大小写 (~10 rules)
  // ============================================================
  {
    wrong: 'javascript',
    right: 'JavaScript',
    context: /javascript/i,
    reason: 'JavaScript 是专有名词，首字母 J 和 S 必须大写',
    category: 'wrong-word',
  },
  {
    wrong: 'JAVAScript',
    right: 'JavaScript',
    reason: 'JavaScript 的正确大小写为 JavaScript',
    category: 'wrong-word',
  },
  {
    wrong: 'Javascript',
    right: 'JavaScript',
    reason: 'JavaScript 的正确大小写为 JavaScript，注意 S 大写',
    category: 'wrong-word',
  },
  {
    wrong: 'github',
    right: 'GitHub',
    reason: 'GitHub 是专有名词，首字母 G 和 H 必须大写',
    category: 'wrong-word',
  },
  {
    wrong: 'Github',
    right: 'GitHub',
    reason: 'GitHub 的正确大小写为 GitHub，注意 H 大写',
    category: 'wrong-word',
  },
  {
    wrong: 'html',
    right: 'HTML',
    context: /(?:<|代码|标签|语言|编程|开发|前端|后端|网页|网站|技术|框架|文件|文档).{0,20}html/i,
    reason: 'HTML 作为技术术语应全大写',
    category: 'wrong-word',
  },
  {
    wrong: 'api',
    right: 'API',
    context: /(?:调用|接口|开发|请求|返回|响应|认证|密钥|服务).{0,20}api/i,
    reason: 'API 作为技术术语应全大写',
    category: 'wrong-word',
  },
  {
    wrong: 'url',
    right: 'URL',
    context: /(?:链接|地址|访问|打开|跳转|请求|网址).{0,20}url/i,
    reason: 'URL 作为技术术语应全大写',
    category: 'wrong-word',
  },
  {
    wrong: 'css',
    right: 'CSS',
    context: /(?:样式|布局|设计|前端|网页|开发|框架).{0,20}css/i,
    reason: 'CSS 作为技术术语应全大写',
    category: 'wrong-word',
  },
  {
    wrong: 'http',
    right: 'HTTP',
    context: /(?:协议|请求|响应|服务器|网络|传输).{0,20}http/i,
    reason: 'HTTP 作为技术术语应全大写',
    category: 'wrong-word',
  },

  // ============================================================
  // 标点符号 (~5 rules)
  // ============================================================
  {
    wrong: ',',
    right: '，',
    context: /[\u4e00-\u9fff],/,
    reason: '中文文本中应使用中文逗号"，"，而非英文逗号","',
    category: 'wrong-char',
  },
  {
    wrong: '.',
    right: '。',
    context: /[\u4e00-\u9fff]\./,
    reason: '中文文本中应使用中文句号"。"，而非英文句号"."',
    category: 'wrong-char',
  },
  {
    wrong: ':',
    right: '：',
    context: /[\u4e00-\u9fff]:/,
    reason: '中文文本中应使用中文冒号"："，而非英文冒号":"',
    category: 'wrong-char',
  },
  {
    wrong: ';',
    right: '；',
    context: /[\u4e00-\u9fff];/,
    reason: '中文文本中应使用中文分号"；"，而非英文分号";"',
    category: 'wrong-char',
  },
  {
    wrong: '!',
    right: '！',
    context: /[\u4e00-\u9fff]!/,
    reason: '中文文本中应使用中文感叹号"！"，而非英文感叹号"!"',
    category: 'wrong-char',
  },

  // ============================================================
  // 网络用语/口语化表达 (~5 rules)
  // ============================================================
  {
    wrong: '酱紫',
    right: '这样子',
    reason: '"酱紫"是网络用语，正式写作中应使用"这样子"',
    category: 'wrong-word',
  },
  {
    wrong: '神马',
    right: '什么',
    reason: '"神马"是网络用语，正式写作中应使用"什么"',
    category: 'wrong-word',
  },
  {
    wrong: '鸭梨',
    right: '压力',
    context: /鸭梨(山大|好大|很大)/,
    reason: '"鸭梨"是网络谐音用语，正式写作中应使用"压力"',
    category: 'wrong-word',
  },
  {
    wrong: '童鞋',
    right: '同学',
    reason: '"童鞋"是网络谐音用语，正式写作中应使用"同学"',
    category: 'wrong-word',
  },
  {
    wrong: '肿么',
    right: '怎么',
    reason: '"肿么"是网络谐音用语，正式写作中应使用"怎么"',
    category: 'wrong-word',
  },

  // ============================================================
  // 其/其它常见错误 (~5 rules)
  // ============================================================
  {
    wrong: '其它人',
    right: '其他人',
    reason: '指代人时应用"其他"，"其它"不用于指人',
    category: 'wrong-char',
  },
  {
    wrong: '其它动物',
    right: '其他动物',
    reason: '现代汉语规范中，"其他"已可通用于人和事物',
    category: 'wrong-char',
  },
  {
    wrong: '其时',
    right: '其实',
    context: /其时(不然|不然吧|不是|很简单|很简单)/,
    reason: '表示转折或补充说明时应用"其实"，"其时"意为"那个时候"',
    category: 'confuse',
  },

  // ============================================================
  // 补充高频易错词 (~10 rules)
  // ============================================================
  {
    wrong: '按装',
    right: '安装',
    reason: '"安装"是正确写法，"按"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '兰天',
    right: '蓝天',
    reason: '"蓝天"是正确写法，"兰"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '兰球',
    right: '篮球',
    reason: '"篮球"是正确写法，"兰"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '象样',
    right: '像样',
    reason: '规范写法为"像样"，"像"取代了"象"',
    category: 'wrong-char',
  },
  {
    wrong: '必竟',
    right: '毕竟',
    reason: '"毕竟"是正确写法，"必"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '报歉',
    right: '抱歉',
    reason: '"抱歉"是正确写法，"报"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '辨论',
    right: '辩论',
    reason: '"辩论"是正确写法，"辨"是常见误写',
    category: 'wrong-char',
  },
  {
    wrong: '不径而走',
    right: '不胫而走',
    reason: '"胫"意为小腿，比喻消息传得快；"径"是误写',
    category: 'wrong-char',
  },
  {
    wrong: '草管人命',
    right: '草菅人命',
    reason: '"菅"是一种野草，比喻把人命当草芥；"管"是常见误写',
    category: 'wrong-char',
  },
]
