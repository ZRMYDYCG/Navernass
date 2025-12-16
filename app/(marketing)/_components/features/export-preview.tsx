'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const formats = ['PDF', 'DOCX', 'TXT', 'MD']

export default function ExportPreview() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % formats.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-yellow-900/10 rounded-lg relative overflow-hidden group-hover:bg-gray-100 dark:group-hover:bg-yellow-800/20 transition-colors">

      <div className="absolute w-16 h-20 bg-white dark:bg-yellow-800/30 border border-gray-200 dark:border-yellow-700/50 rotate-6 translate-x-2 opacity-50" />
      <div className="absolute w-16 h-20 bg-white dark:bg-yellow-800/30 border border-gray-200 dark:border-yellow-700/50 -rotate-6 -translate-x-2 opacity-50" />

      <motion.div
        className="relative z-10 w-16 h-20 bg-white dark:bg-yellow-800/30 border border-gray-200 dark:border-yellow-700/50 shadow-md flex flex-col items-center justify-center gap-2 cursor-pointer"
        whileHover={{ y: -5, scale: 1.05 }}
      >
        <div className="w-8 h-1 bg-gray-200 dark:bg-yellow-600/60 rounded-full" />
        <div className="w-8 h-1 bg-gray-200 dark:bg-yellow-600/60 rounded-full" />
        <div className="w-5 h-1 bg-gray-200 dark:bg-yellow-600/60 rounded-full mr-3" />

        <motion.div
          key={formats[index]}
          initial={{ rotate: -30, opacity: 0, y: 5 }}
          animate={{ rotate: 0, opacity: 1, y: 0 }}
          exit={{ rotate: 30, opacity: 0, y: -5 }}
          transition={{ duration: 0.6 }}
          className="absolute -right-2 -bottom-2 w-8 h-8 bg-black rounded-full text-[10px] text-white flex items-center justify-center font-bold"
        >
          {formats[index]}
        </motion.div>
      </motion.div>
    </div>
  )
}
