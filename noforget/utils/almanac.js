// utils/almanac.js - 现代黄历数据
// 统一首页黄历入口与黄历详情页
// 农历日期/节气/干支：本地农历库精准计算
// 宜/忌：直接使用本地 lunar.js 干支算法，精准且稳定

const {Solar} = require('../lib/lunar.js')

const MONTHS = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
const DAYS = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']

// ============================================================
// 工具函数
// ============================================================

function pad(n) {
  return String(n).padStart(2, '0')
}

function hashDate(date) {
  // 改用 YYYYMMDD 数字格式（20260507），消除单数字月份/日期的字符碰撞
  const combined = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  const str = String(combined)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function pick(list, hash, count) {
  const pool = list.slice()
  const result = []
  let seed = hash
  while (pool.length && result.length < count) {
    const idx = seed % pool.length
    result.push(pool.splice(idx, 1)[0])
    seed = Math.floor(seed / 3) + 7
  }
  return result
}

// ============================================================
// 历史上的今天：本地策展数据优先
// 上线版本不依赖客户端临时抓取，避免域名白名单与内容漂移问题
// ============================================================

const HISTORY_CATEGORY_LABELS = {
  china_ancient: '古代中国',
  china_modern: '近现代中国',
  world: '世界史'
}

const HISTORY = {
  '01-01': [
    {year: 1863, title: '林肯签署《解放黑人奴隶宣言》', category: 'world', weight: 5},
    {year: 1995, title: '世界贸易组织正式成立', category: 'world', weight: 5}
  ],
  '02-14': [
    {year: 1876, title: '贝尔申请电话专利', category: 'world', weight: 4},
    {year: 1946, title: '世界上第一台通用电子计算机 ENIAC 发布', category: 'world', weight: 5}
  ],
  '03-08': [
    {year: 1909, title: '美国芝加哥妇女争取平等权利游行', category: 'world', weight: 4},
    {year: 1917, title: '俄国二月革命序幕开启', category: 'world', weight: 5}
  ],
  '04-23': [
    {year: 1616, title: '莎士比亚逝世', category: 'world', weight: 4},
    {year: 1995, title: '联合国教科文组织设立世界读书日', category: 'world', weight: 4}
  ],
  '05-01': [
    {year: 1886, title: '芝加哥工人大罢工，国际劳动节由此纪念', category: 'world', weight: 5},
    {year: 2010, title: '上海世博会开幕', category: 'china_modern', weight: 5}
  ],
  '05-02': [
    {year: 1808, title: '拿破仑宣布封锁英国港口', category: 'world', weight: 4},
    {year: 1945, title: '人类第一台计算机 ENIAC 正式退役', category: 'world', weight: 3}
  ],
  '05-03': [
    {year: 1616, title: '莎士比亚与塞万提斯同日在历史上消逝', category: 'world', weight: 4},
    {year: 1903, title: '福特汽车公司成立', category: 'world', weight: 5}
  ],
  '05-04': [
    {year: 1919, title: '五四运动爆发', category: 'china_modern', weight: 5},
    {year: 1953, title: '海明威凭《老人与海》获普利策奖', category: 'world', weight: 4}
  ],
  '05-05': [
    {year: 1818, title: '马克思诞生于德国特里尔', category: 'world', weight: 4},
    {year: 1945, title: '德国无条件投降，二战欧洲战场结束', category: 'world', weight: 5}
  ],
  '05-06': [
    {year: 1889, title: '埃菲尔铁塔在巴黎世博会上正式对外开放', category: 'world', weight: 4},
    {year: 1994, title: '卢旺达种族大屠杀结束', category: 'world', weight: 4}
  ],
  '05-07': [
    {year: 1999, title: '北约轰炸中国驻南联盟大使馆', category: 'china_modern', weight: 5},
    {year: 1999, title: '中国政府发表严正声明', category: 'china_modern', weight: 4}
  ],
  '05-08': [
    {year: 689, title: '唐朝女政治家上官婉儿出生', category: 'china_ancient', weight: 3},
    {year: 1945, title: '德国签署无条件投降书，欧洲胜利日到来', category: 'world', weight: 5},
    {year: 1949, title: '人民海军首届院校开学，现代海军教育体系启动', category: 'china_modern', weight: 3},
    {year: 1980, title: '韩国爆发光州民主化运动', category: 'world', weight: 4}
  ],
  '05-09': [
    {year: 1901, title: '中国第一辆国产汽车诞生', category: 'china_modern', weight: 4},
    {year: 1945, title: '苏联设立卫国战争胜利纪念日', category: 'world', weight: 4}
  ],
  '05-10': [
    {year: 1906, title: '法国巴黎博览会上出现第一批地铁', category: 'world', weight: 3},
    {year: 1940, title: '德军绕过马奇诺防线入侵法国', category: 'world', weight: 5}
  ],
  '05-11': [
    {year: 1860, title: '太平天国开始天京事变', category: 'china_modern', weight: 4},
    {year: 868, title: '王仙芝、黄巢起义后期形势转折，晚唐局势进一步动荡', category: 'china_ancient', weight: 3},
    {year: 1998, title: '印度进行核试验，引发国际制裁', category: 'world', weight: 4},
    {year: 1960, title: '以色列特工在阿根廷抓获纳粹战犯艾希曼', category: 'world', weight: 4}
  ],
  '05-12': [
    {year: 1949, title: '暹罗正式更名为泰国', category: 'world', weight: 4},
    {year: 2008, title: '中国汶川发生特大地震', category: 'china_modern', weight: 5}
  ],
  '05-13': [
    {year: 1846, title: '美国对墨西哥宣战', category: 'world', weight: 4},
    {year: 2007, title: '美国成功发射凤凰号火星探测器', category: 'world', weight: 4}
  ],
  '05-14': [
    {year: 1973, title: '美国太空站 Skylab 成功发射', category: 'world', weight: 4},
    {year: 2010, title: '上海世博会进入全面运营阶段', category: 'china_modern', weight: 3}
  ],
  '05-15': [
    {year: 1918, title: '世界上第一架客运飞机完成首次商业飞行', category: 'world', weight: 4},
    {year: 1948, title: '以色列宣布建国，引发第一次中东战争', category: 'world', weight: 5}
  ],
  '05-16': [
    {year: 1943, title: '华沙犹太区起义失败', category: 'world', weight: 4},
    {year: 1992, title: '上海石化股份有限公司成立', category: 'china_modern', weight: 3}
  ],
  '05-17': [
    {year: 1990, title: '世界卫生组织将同性恋从疾病目录中除名', category: 'world', weight: 5},
    {year: 1997, title: '印度进行地下核试验', category: 'world', weight: 4}
  ],
  '05-18': [
    {year: 1980, title: '韩国发生光州民主化运动', category: 'world', weight: 4},
    {year: 2009, title: '世界卫生组织宣布甲型 H1N1 流感全球大流行', category: 'world', weight: 4}
  ],
  '05-19': [
    {year: 1125, title: '宋代词人李清照逝世', category: 'china_ancient', weight: 4},
    {year: 2006, title: '航海家1号进入太阳系边缘区域', category: 'world', weight: 4}
  ],
  '05-20': [
    {year: 1941, title: '德军发动巴巴罗萨行动闪击苏联', category: 'world', weight: 5},
    {year: 2002, title: '台湾核四议题引发新一轮反核运动', category: 'china_modern', weight: 3}
  ],
  '05-21': [
    {year: 1904, title: '法国通过《世俗法》政教分离', category: 'world', weight: 4},
    {year: 1991, title: '印度前总理拉吉夫·甘地遇刺', category: 'world', weight: 4}
  ],
  '05-22': [
    {year: 1960, title: '智利发生 9.5 级特大地震', category: 'world', weight: 4},
    {year: 1969, title: '布拉格之春改革运动被镇压', category: 'world', weight: 4}
  ],
  '05-23': [
    {year: 1951, title: '西藏和平解放协议签订', category: 'china_modern', weight: 5},
    {year: 1993, title: '红豆集团成立', category: 'china_modern', weight: 2}
  ],
  '05-24': [
    {year: 1844, title: '摩尔斯发出人类历史上第一份电报', category: 'world', weight: 5},
    {year: 1993, title: '北京第一次申奥失败', category: 'china_modern', weight: 4}
  ],
  '05-25': [
    {year: 1925, title: '五卅运动导火索事件发生于上海', category: 'china_modern', weight: 5},
    {year: 1979, title: '美国宣布驻中国联络处成立', category: 'world', weight: 3}
  ],
  '05-26': [
    {year: 1938, title: '台儿庄战役胜利结束', category: 'china_modern', weight: 5},
    {year: 2006, title: '波兰公开卡廷森林事件部分真相', category: 'world', weight: 3}
  ],
  '05-27': [
    {year: 1930, title: '周口店北京人遗址进一步得到国际关注', category: 'china_modern', weight: 3},
    {year: 1942, title: '中国远征军完成缅甸战场历史性撤退', category: 'china_modern', weight: 4}
  ],
  '05-28': [
    {year: 1858, title: '中俄签订《瑷珲条约》', category: 'china_modern', weight: 5},
    {year: 1923, title: '埃及开始修建阿斯旺水坝', category: 'world', weight: 3}
  ],
  '05-29': [
    {year: 1453, title: '君士坦丁堡陷落，拜占庭帝国终结', category: 'world', weight: 5},
    {year: 1919, title: '人类完成首次飞越大西洋', category: 'world', weight: 4}
  ],
  '05-30': [
    {year: 1925, title: '上海爆发五卅惨案', category: 'china_modern', weight: 5},
    {year: 1983, title: '中国石油大学成立', category: 'china_modern', weight: 2}
  ],
  '05-31': [
    {year: 1924, title: '中国与苏联签订《中苏协定》', category: 'china_modern', weight: 4},
    {year: 1993, title: '博帕尔毒气泄漏事故善后进程进入尾声', category: 'world', weight: 3}
  ],
  '06-01': [
    {year: 1925, title: '国际儿童节相关倡议开始形成', category: 'world', weight: 4},
    {year: 1980, title: 'CNN 开播', category: 'world', weight: 4}
  ],
  '07-20': [
    {year: 1969, title: '阿波罗11号登月', category: 'world', weight: 5},
    {year: 1973, title: '李小龙逝世', category: 'china_modern', weight: 4}
  ],
  '08-08': [
    {year: 2008, title: '北京奥运会开幕', category: 'china_modern', weight: 5},
    {year: 1967, title: '东南亚国家联盟成立', category: 'world', weight: 4}
  ],
  '09-10': [
    {year: 1985, title: '中国第一个教师节到来', category: 'china_modern', weight: 4},
    {year: 1960, title: '欧佩克成立前夕，多国完成关键磋商', category: 'world', weight: 3}
  ],
  '10-01': [
    {year: 1949, title: '中华人民共和国成立', category: 'china_modern', weight: 5},
    {year: 2010, title: '嫦娥二号探月卫星发射', category: 'china_modern', weight: 4}
  ]
}

function normalizeHistoryEvent(entry) {
  if (!entry) return null
  if (typeof entry === 'object') {
    const category = entry.category || 'world'
    return {
      year: entry.year,
      title: entry.title,
      category,
      categoryLabel: HISTORY_CATEGORY_LABELS[category] || '历史',
      weight: entry.weight || 1,
      displayText: `${entry.year}年 ${entry.title}`
    }
  }

  const match = String(entry).match(/^(.+?)年\s*(.+)$/)
  if (!match) {
    return {
      year: '',
      title: String(entry),
      category: 'world',
      categoryLabel: HISTORY_CATEGORY_LABELS.world,
      weight: 1,
      displayText: String(entry)
    }
  }

  const year = match[1]
  const title = match[2]
  return {
    year,
    title,
    category: 'world',
    categoryLabel: HISTORY_CATEGORY_LABELS.world,
    weight: 1,
    displayText: `${year}年 ${title}`
  }
}

function selectHistoryEvents(events, limit = 4) {
  const normalized = (events || []).map(normalizeHistoryEvent).filter(Boolean)
  if (!normalized.length) return []

  const selected = []
  const used = new Set()
  const preferredCategories = ['china_ancient', 'china_modern', 'world']

  preferredCategories.forEach(category => {
    const candidate = normalized
      .filter(item => item.category === category && !used.has(item.displayText))
      .sort((a, b) => (b.weight || 0) - (a.weight || 0))[0]
    if (candidate && selected.length < limit) {
      selected.push(candidate)
      used.add(candidate.displayText)
    }
  })

  normalized
    .sort((a, b) => (b.weight || 0) - (a.weight || 0))
    .forEach(item => {
      if (selected.length >= limit || used.has(item.displayText)) return
      selected.push(item)
      used.add(item.displayText)
    })

  return selected.slice(0, limit)
}

async function buildHistoryEvents(date) {
  return buildHistoryEventsSync(date)
}
// 同步版：只用本地历史数据，不访问网络（用于 Wikipedia 超时时的兜底）
function buildHistoryEventsSync(date) {
  const key = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  const primary = HISTORY[key] || []
  return primary.length > 0 ? selectHistoryEvents(primary, 4) : []
}


// ============================================================
// 黄历宜忌：直接使用本地 lunar.js 干支算法
// 微信小程序无法访问外部黄历 API，直接用本地算法更稳定
// ============================================================
// 主函数：异步构建完整黄历
// ============================================================

/**
 * 异步构建完整黄历数据
 * - 农历/节气/干支：本地库实时计算（精准）
 * - 宜/忌：直接使用本地 lunar.js 干支算法，精准且稳定
 * - 现代版宜忌/名言：本地生成
 * @param {Date} date
 * @returns {Promise<Object>}
 */
async function buildAlmanac(date = new Date()) {
  // 全程不使用 apiResult，彻底避免 ReferenceError
  const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate())
  const lunar = solar.getLunar()
  const hash = hashDate(date)

  // 历史上的今天：异步调用维基百科API（失败则走 HISTORY 词库 + 叙事句）
  const historyEvents = await buildHistoryEvents(date)

  // 传统宜忌：本地 lunar.js 算法兜底
  const localYi = lunar.getDayYi ? lunar.getDayYi().slice(0, 6) : []
  const localJi = lunar.getDayJi ? lunar.getDayJi().slice(0, 6) : []
  const fallbackYi = ['祭祀', '出行', '会友', '整理', '纳财', '学习', '祈福', '安床']
  const fallbackJi = ['争执', '动土', '远行', '破土', '熬夜', '急躁', '冲动消费', '久坐']

  // 宜忌：本地算法优先，其次 fallback
  let yi = localYi.length > 0 ? localYi : pick(fallbackYi, hash, 6)
  let ji = localJi.length > 0 ? localJi : pick(fallbackJi, hash + 11, 6)

  const festivals = [
    ...(solar.getFestivals ? solar.getFestivals() : []),
    ...(lunar.getFestivals ? lunar.getFestivals() : [])
  ].filter(Boolean)
  const jieQi = lunar.getJieQi ? lunar.getJieQi() : ''

  // 现代版宜忌：纯本地 Hash 生成
  const modernYiList = [
    '奖励自己', '整理日程', '记录灵感', '联系旧友', '提前准备', '轻量运动', '早些休息', '认真吃饭',
    '断舍离', '泡杯热茶', '慢下来', '写日记', '晒晒太阳', '深呼吸', '读几页书', '听一首老歌',
    '清理手机', '做顿早餐', '出门散步', '放下手机', '原谅自己', '换个发型', '泡个热水澡', '学道新菜'
  ]
  const modernJiList = [
    '精神内耗', '冲动消费', '拖延正事', '深夜emo', '过度纠结', '临时爽约', '带情绪沟通', '报复性熬夜',
    '刷短视频停不下来', '和陌生人抬杠', '过度比较', '翻前任动态', '暴饮暴食', '强行社交', '胡思乱想', '称体重',
    '透支信用卡', '发长语音', '半夜看吃播', '回消息秒回', '心情不好就购物', '为未来焦虑', '自我否定', '把工作带回家'
  ]
  const quoteList = [
    '世界太吵，今天适合按下静音键。',
    '比起懂事，今天更适合开心。',
    '保持钝感，是今天的护身符。',
    '不要为了还没有发生的事情焦虑。',
    '今天宜偏爱自己，且没有上限。',
    '把重要的日子放在眼前。',
    '你不需要每天都发光，今天可以只是呼吸。',
    '有些日子不一定是答案，却是很好的逗号。',
    '生活不是闯关游戏，偶尔走走神也没关系。',
    '允许一切如其所是，包括今天的自己。',
    '不着急，好的事情往往都需要一点时间。',
    '温柔对待自己，是今天最重要的事。',
    '有时候停下来，才能看清楚方向。',
    '你可以先成为自己的靠山。',
    '努力了很久的你，今天可以松口气。',
    '今天适合把日子过成自己喜欢的样子。'
  ]

  return {
    solarDate: `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`,
    solarIso: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    week: `星期${solar.getWeekInChinese ? solar.getWeekInChinese() : ''}`,
    lunarMonth: `${MONTHS[Math.abs(lunar.getMonth())]}月`,
    lunarDay: DAYS[lunar.getDay()],
    lunarFull: `${MONTHS[Math.abs(lunar.getMonth())]}月${DAYS[lunar.getDay()]}`,
    dayGanZhi: lunar.getDayInGanZhi ? lunar.getDayInGanZhi() : '',
    monthGanZhi: lunar.getMonthInGanZhi ? lunar.getMonthInGanZhi() : '',
    yearGanZhi: lunar.getYearInGanZhi ? lunar.getYearInGanZhi() : '',
    zodiac: lunar.getYearShengXiao ? lunar.getYearShengXiao() : '',
    jieQi,
    festivals,
    yi,
    ji,
    modernYi: [modernYiList[hash % modernYiList.length], modernYiList[(hash + 3) % modernYiList.length]],
    modernJi: [modernJiList[(hash + 7) % modernJiList.length], modernJiList[(hash + 11) % modernJiList.length]],
    quote: quoteList[hash % quoteList.length],
    chong: lunar.getChongDesc ? lunar.getChongDesc() : '',
    sha: lunar.getSha ? lunar.getSha() : '',
    xiu: lunar.getXiu ? `${lunar.getXiu()}宿` : '',
    xiuLuck: lunar.getXiuLuck ? lunar.getXiuLuck() : '',
    pengzu: [
      lunar.getPengZuGan ? lunar.getPengZuGan() : '',
      lunar.getPengZuZhi ? lunar.getPengZuZhi() : ''
    ].filter(Boolean),
    history: historyEvents || []
  }
}


/**
 * 同步构建黄历基础数据（无 API 调用，用于首页快速展示）
 * 页面加载时先用这个，异步版本随后替换
 */
function buildAlmanacSync(date = new Date()) {
  const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate())
  const lunar = solar.getLunar()
  const hash = hashDate(date)
  const yi = lunar.getDayYi ? lunar.getDayYi().slice(0, 6) : []
  const ji = lunar.getDayJi ? lunar.getDayJi().slice(0, 6) : []
  const fallbackYi = ['祭祀', '出行', '会友', '整理', '纳财', '学习', '祈福', '安床']
  const fallbackJi = ['争执', '动土', '远行', '破土', '熬夜', '急躁', '冲动消费', '久坐']
  const festivals = [
    ...(solar.getFestivals ? solar.getFestivals() : []),
    ...(lunar.getFestivals ? lunar.getFestivals() : [])
  ].filter(Boolean)
  const jieQi = lunar.getJieQi ? lunar.getJieQi() : ''
  const modernYiPool = [
    '奖励自己', '整理日程', '记录灵感', '联系旧友', '提前准备', '轻量运动', '早些休息', '认真吃饭',
    '断舍离', '泡杯热茶', '慢下来', '写日记', '晒晒太阳', '深呼吸', '读几页书', '听一首老歌',
    '清理手机', '做顿早餐', '出门散步', '放下手机', '原谅自己', '换个发型', '泡个热水澡', '学道新菜'
  ]
  const modernJiPool = [
    '精神内耗', '冲动消费', '拖延正事', '深夜emo', '过度纠结', '临时爽约', '带情绪沟通', '报复性熬夜',
    '刷短视频停不下来', '和陌生人抬杠', '过度比较', '翻前任动态', '暴饮暴食', '强行社交', '胡思乱想', '称体重',
    '透支信用卡', '发长语音', '半夜看吃播', '回消息秒回', '心情不好就购物', '为未来焦虑', '自我否定', '把工作带回家'
  ]
  const quotePool = [
    '世界太吵，今天适合按下静音键。',
    '比起懂事，今天更适合开心。',
    '保持钝感，是今天的护身符。',
    '不要为了还没有发生的事情焦虑。',
    '今天宜偏爱自己，且没有上限。',
    '把重要的日子放在眼前。',
    '你不需要每天都发光，今天可以只是呼吸。',
    '有些日子不一定是答案，却是很好的逗号。',
    '生活不是闯关游戏，偶尔走走神也没关系。',
    '允许一切如其所是，包括今天的自己。',
    '不着急，好的事情往往都需要一点时间。',
    '温柔对待自己，是今天最重要的事。',
    '有时候停下来，才能看清楚方向。',
    '你可以先成为自己的靠山。',
    '努力了很久的你，今天可以松口气。',
    '今天适合把日子过成自己喜欢的样子。'
  ]

  return {
    solarDate: `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`,
    solarIso: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    week: `星期${solar.getWeekInChinese ? solar.getWeekInChinese() : ''}`,
    lunarMonth: `${MONTHS[Math.abs(lunar.getMonth())]}月`,
    lunarDay: DAYS[lunar.getDay()],
    lunarFull: `${MONTHS[Math.abs(lunar.getMonth())]}月${DAYS[lunar.getDay()]}`,
    dayGanZhi: lunar.getDayInGanZhi ? lunar.getDayInGanZhi() : '',
    monthGanZhi: lunar.getMonthInGanZhi ? lunar.getMonthInGanZhi() : '',
    yearGanZhi: lunar.getYearInGanZhi ? lunar.getYearInGanZhi() : '',
    zodiac: lunar.getYearShengXiao ? lunar.getYearShengXiao() : '',
    jieQi,
    festivals,
    yi: yi.length ? yi : pick(fallbackYi, hash, 6),
    ji: ji.length ? ji : pick(fallbackJi, hash + 11, 6),
    modernYi: pick(modernYiPool, hash + 3, 3),
    modernJi: pick(modernJiPool, hash + 17, 3),
    chong: lunar.getChongDesc ? lunar.getChongDesc() : '',
    sha: lunar.getSha ? lunar.getSha() : '',
    xiu: lunar.getXiu ? `${lunar.getXiu()}宿` : '',
    xiuLuck: lunar.getXiuLuck ? lunar.getXiuLuck() : '',
    pengzu: [
      lunar.getPengZuGan ? lunar.getPengZuGan() : '',
      lunar.getPengZuZhi ? lunar.getPengZuZhi() : ''
    ].filter(Boolean),
    quote: quotePool[hash % quotePool.length]
  }
}

module.exports = {
  buildAlmanac,
  buildAlmanacSync,
  buildHistoryEvents,
  buildHistoryEventsSync
}
