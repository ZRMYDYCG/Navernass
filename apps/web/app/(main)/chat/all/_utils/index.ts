import type { ChatItem, DateGroup } from '../types'

export function formatDate(
  date: Date,
  options: { locale: string, todayLabel: string, yesterdayLabel: string }
): { date: string, label: string } {
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
    return { date: 'today', label: options.todayLabel }
  } else if (targetDate.getTime() === yesterdayDate.getTime()) {
    return { date: 'yesterday', label: options.yesterdayLabel }
  } else {
    return {
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString(options.locale, { month: 'long', day: 'numeric' }),
    }
  }
}

export function groupChatsByDate(
  chats: ChatItem[],
  options: { locale: string, todayLabel: string, yesterdayLabel: string }
): DateGroup[] {
  const groups: { [key: string]: ChatItem[] } = {}

  chats.forEach((chat) => {
    const { date } = formatDate(chat.createdAt, options)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(chat)
  })

  return Object.entries(groups).map(([date, chats]) => {
    const label = formatDate(chats[0].createdAt, options).label
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

export function formatTime(date: Date, locale: string): string {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}
