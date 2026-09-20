import type { NewsItem } from '../types'

/**
 * 按年份分组动态数据
 */
export function groupNewsByYear(items: NewsItem[]) {
  const groups = new Map<string, NewsItem[]>()

  items.forEach((item) => {
    // 从日期字符串中提取年份，例如 "2025年10月17日" -> "2025"
    const year = item.date.match(/(\d{4})年/)?.[1] || '未知'

    if (!groups.has(year)) {
      groups.set(year, [])
    }
    groups.get(year)?.push(item)
  })

  return Array.from(groups.entries())
    .map(([year, items]) => ({ year, items }))
    .sort((a, b) => Number(b.year) - Number(a.year)) // 按年份降序排列
}

/**
 * 根据关键词过滤动态
 */
export function filterNews(items: NewsItem[], query: string): NewsItem[] {
  if (!query.trim()) return items

  const lowerQuery = query.toLowerCase().trim()

  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
  )
}

