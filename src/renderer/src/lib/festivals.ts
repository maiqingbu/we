import type { FestivalMeta } from '../materials/types'

/**
 * 获取即将到来的节日（30天内）
 * 使用 solarlunar 库进行农历转换
 */
export function getUpcomingFestivals(festivals: FestivalMeta[]): Array<FestivalMeta & { date: Date; daysLeft: number }> {
  const now = new Date()
  const results: Array<FestivalMeta & { date: Date; daysLeft: number }> = []

  // 延迟加载 solarlunar
  let solarlunar: any = null
  try {
    solarlunar = require('solarlunar').default
  } catch {
    // solarlunar 不可用时，只处理公历节日
  }

  for (const f of festivals) {
    let festivalDate: Date | null = null

    if (f.month && f.day) {
      // 公历节日：计算今年和明年的日期
      const thisYear = new Date(now.getFullYear(), f.month - 1, f.day)
      if (thisYear >= now) {
        festivalDate = thisYear
      } else {
        // 已过，看明年
        const nextYear = new Date(now.getFullYear() + 1, f.month - 1, f.day)
        festivalDate = nextYear
      }
    } else if (f.lunarMonth && f.lunarDay && solarlunar) {
      // 农历节日：使用 lunar2solar 转换
      for (let year = now.getFullYear(); year <= now.getFullYear() + 1; year++) {
        try {
          const solar = solarlunar.lunar2solar(year, f.lunarMonth, f.lunarDay)
          if (solar) {
            const date = new Date(solar.cYear, solar.cMonth - 1, solar.cDay)
            if (date >= now) {
              festivalDate = date
              break
            }
          }
        } catch {
          // 跳过无效日期（如闰月不存在的日期）
        }
      }
    }

    if (festivalDate) {
      const daysLeft = Math.ceil((festivalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysLeft <= 30) {
        results.push({ ...f, date: festivalDate, daysLeft })
      }
    }
  }

  // 按天数排序
  results.sort((a, b) => a.daysLeft - b.daysLeft)
  return results
}
