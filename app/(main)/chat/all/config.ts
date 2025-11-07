// 模拟数据
import type { ChatItem } from './types'

export const mockChats: ChatItem[] = [
  { id: '1', title: '创建故事背景', createdAt: new Date('2024-11-06T10:30:00'), isPinned: true },
  { id: '2', title: '实现故事背景效果', createdAt: new Date('2024-11-06T14:20:00') },
  { id: '3', title: '优化3D地图效果', createdAt: new Date('2024-11-05T16:45:00') },
  { id: '4', title: '调整地图配色和样式', createdAt: new Date('2024-11-05T11:30:00') },
  { id: '5', title: '修改logo区域文字颜色', createdAt: new Date('2024-11-04T09:15:00'), isPinned: true },
  { id: '6', title: '重构顶部导航组件', createdAt: new Date('2024-11-04T14:00:00') },
  { id: '7', title: 'Translation Request', createdAt: new Date('2024-11-03T20:30:00') },
  { id: '8', title: 'Biome使用指南', createdAt: new Date('2024-11-03T13:22:00') },
  { id: '9', title: 'Add Logging Tool Module', createdAt: new Date('2024-11-02T10:10:00') },
  { id: '10', title: 'Function Format Conversion', createdAt: new Date('2024-11-02T15:45:00') },
  { id: '11', title: 'Add Incremental Builds', createdAt: new Date('2024-11-01T11:20:00') },
  { id: '12', title: 'Translate to English', createdAt: new Date('2024-11-01T09:30:00') },
  { id: '13', title: 'Translation Task', createdAt: new Date('2024-10-31T17:50:00') },
]

// UI 常量配置
export const UI_CONFIG = {
  search: {
    placeholder: '搜索对话...',
    width: 'w-64',
  },
  batch: {
    emptyText: '已选择 0 项',
  },
  empty: {
    message: '没有找到对话',
  },
}

// 路由配置
export const ROUTES = {
  chat: '/chat',
  chatDetail: (id: string) => `/chat/${id}`,
}
