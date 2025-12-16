'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function EditorPreview() {
  const [text, setText] = useState('')
  const fullText = '暴雨后的沥青味道，唤醒了久违的记忆，空气中弥漫着泥土与青草的气息...'

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setText(fullText.slice(0, i))
      i++
      if (i > fullText.length) {
        i = 0
        setText('') // 重置文字
      }
    }, 120)
    return () => clearInterval(interval)
  }, [fullText])

  return (
    <div className="w-full h-full bg-white dark:bg-yellow-900/10 rounded-xl shadow-md border border-gray-100 dark:border-yellow-800/30 p-6 font-serif relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/30 dark:bg-yellow-600/40 rounded-b-full" />

      <div className="text-gray-400 dark:text-yellow-200/70 text-xs mb-4 flex justify-between select-none">
        <span>Chapter 1</span>
        <span>Saving...</span>
      </div>

      <div className="flex-1 overflow-hidden">
        <p className="text-gray-800 dark:text-yellow-50/90 text-base sm:text-lg leading-relaxed break-words whitespace-pre-wrap">
          {text}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-block w-0.5 h-5 bg-primary align-middle ml-0.5"
          />
        </p>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white/70 via-transparent to-white/50 dark:from-yellow-900/70 dark:via-transparent dark:to-yellow-900/50 rounded-xl" />
    </div>
  )
}
