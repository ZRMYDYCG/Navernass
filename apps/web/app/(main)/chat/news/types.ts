/**
 * 产品动态数据类型定义
 */

export interface NewsItem {
  id: string
  title: string
  description: string
  coverImage: string
  date: string
  status?: 'new' | 'updated' | 'hot'
  link?: string
}

export interface NewsGroup {
  year: string
  items: NewsItem[]
}
