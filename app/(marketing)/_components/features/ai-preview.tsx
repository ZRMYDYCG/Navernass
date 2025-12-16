'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AIPreview() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const cycle = async () => {
      setStage(0)
      await new Promise(r => setTimeout(r, 1500))
      setStage(1)
      await new Promise(r => setTimeout(r, 1500))
      setStage(2)
      await new Promise(r => setTimeout(r, 3000))
      cycle()
    }
    cycle()
  }, [])

  return (
    <div className="
      w-full h-full rounded-xl p-5 relative flex flex-col
      bg-gradient-to-br from-stone-50 via-white to-stone-100 dark:from-yellow-900/10 dark:via-yellow-900/5 dark:to-yellow-900/10
      border border-stone-200 dark:border-yellow-800/30 shadow-sm
    "
    >
      {/* 顶部柔光点 */}
      <div className="absolute top-2 right-3 opacity-50">
        <Sparkles className="text-amber-300 w-4 h-4 animate-pulse" />
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto space-y-4 mt-2 pr-1">
        {/* 用户输入（便签风） */}
        <motion.div
          animate={{ opacity: stage >= 0 ? 1 : 0, y: stage >= 0 ? 0 : 10 }}
          className="
            bg-white/90 dark:bg-yellow-900/30 backdrop-blur-sm px-3 py-2
            rounded-lg rounded-tr-none shadow
            self-end ml-auto max-w-[78%] max-h-36 overflow-y-auto
            text-[11px] text-gray-700 dark:text-yellow-100/80
            border border-stone-200 dark:border-yellow-700/50
            font-serif leading-relaxed
          "
        >
          如何形容"尴尬的沉默"？
        </motion.div>

        {/* AI Response */}
        <AnimatePresence mode="wait">
          {stage === 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex gap-1 items-center pl-1"
            >
              <span className="w-2 h-2 bg-stone-500 dark:bg-yellow-600/80 rounded-full animate-pulse" />
              <span className="w-2 h-2 bg-stone-500 dark:bg-yellow-600/80 rounded-full animate-pulse delay-100" />
              <span className="w-2 h-2 bg-stone-500 dark:bg-yellow-600/80 rounded-full animate-pulse delay-200" />
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div
              key="ai-output"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="
                bg-stone-800 text-white px-4 py-3
                rounded-xl rounded-tl-none shadow-md
                text-[11px] leading-relaxed font-serif
                max-w-[82%] max-h-48 overflow-y-auto
              "
            >
              空气仿佛被揉皱了，沉默像一张没来得及铺平的纸，
              轻轻拢在两人之间。
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
