import type { NewsItem } from './types'

/**
 * 产品动态Mock数据
 */
export const mockNewsItems: NewsItem[] = [
  {
    id: '3',
    title: '[AI 对话] 全新对话界面升级',
    description:
      '全新设计的对话界面，支持更流畅的交互体验，优化了消息展示和输入方式，让您的创作更加便捷高效。',
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074',
    date: '2025年10月10日',
    link: '#',
  },
  {
    id: '4',
    title: '[编辑器] 实时协作功能上线',
    description:
      '现在您可以邀请团队成员一起编辑文档，实时查看彼此的更改，让团队协作更加高效便捷。',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070',
    date: '2025年10月5日',
    status: 'hot',
    link: '#',
  },
  {
    id: '5',
    title: '[性能优化] 编辑器响应速度提升',
    description:
      '全面优化编辑器性能，响应速度提升50%，大文档处理能力显著增强，为您带来更流畅的创作体验。',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015',
    date: '2025年9月28日',
    link: '#',
  },
]

/**
 * UI 配置常量
 */
export const UI_CONFIG = {
  header: {
    title: '产品动态',
    subtitle: '探索产品功能版权最新更新动态',
  },
  statusLabels: {
    new: '新一波',
    updated: '更新了',
    hot: '火一把',
  },
  card: {
    linkText: '查一波',
  },
}

/**
 * 路由配置
 */
export const ROUTES = {
  chat: '/chat',
}
