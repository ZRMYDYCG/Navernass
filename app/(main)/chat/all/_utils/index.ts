import type { ChatItem, DateGroup } from '../types'

export function formatDate(date: Date): { date: string, label: string } {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  const nowDate = new Date(now)
  nowDate.setHours(0, 0, 0, 0)
  const yesterdayDate = new Date(yesterday)
  yesterdayDate.setHours(0, 0, 0, 0)

  if (targetDate.getTime() === nowDate.getTime()) {
    return { date: 'today', label: '今天' }
  } else if (targetDate.getTime() === yesterdayDate.getTime()) {
    return { date: 'yesterday', label: '昨天' }
  } else {
    return {
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }),
    }
  }
}

export function groupChatsByDate(chats: ChatItem[]): DateGroup[] {
  const groups: { [key: string]: ChatItem[] } = {}

  chats.forEach((chat) => {
    const { date } = formatDate(chat.createdAt)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(chat)
  })

  return Object.entries(groups).map(([date, chats]) => {
    const label = formatDate(chats[0].createdAt).label
    return {
      date,
      label,
      chats: chats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    }
  })
}

export function filterChats(chats: ChatItem[], query: string): ChatItem[] {
  if (!query.trim()) {
    return chats
  }
  const lowerQuery = query.toLowerCase()
  return chats.filter(chat => chat.title.toLowerCase().includes(lowerQuery))
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
