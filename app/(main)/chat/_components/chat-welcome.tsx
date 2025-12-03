'use client'

import { useState } from 'react'

interface ChatWelcomeProps {
  isLoading?: boolean
}

function getGreeting() {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return '早上好'
  } else if (hour >= 12 && hour < 18) {
    return '下午好'
  } else if (hour >= 18 && hour < 22) {
    return '晚上好'
  } else {
    return '夜深了'
  }
}

export function ChatWelcome({ isLoading = false }: ChatWelcomeProps) {
  const [greeting] = useState(() => getGreeting())

  return (
    <div className="text-center mb-3 space-y-6">
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          {greeting}
          ，准备好开始创作了吗？
        </h1>

        <p className="text-lg text-gray-500 dark:text-gray-400">
          {isLoading ? '正在创建对话...' : '让 AI 助手陪你一起编织精彩的故事'}
        </p>
      </div>
    </div>
  )
}
