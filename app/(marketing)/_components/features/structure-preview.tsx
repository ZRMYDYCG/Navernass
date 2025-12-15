'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function StructurePreview() {
  const [items, setItems] = useState([
    { id: 1, text: '第一章：相遇', color: 'bg-blue-50' },
    { id: 2, text: '第二章：冲突', color: 'bg-orange-50' },
    { id: 3, text: '第三章：转折', color: 'bg-rose-50' },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        const newItems = [...prev]
        const itemToMove = newItems.pop()
        if (itemToMove) {
          newItems.unshift(itemToMove)
        }
        return newItems
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-full p-4 flex flex-col gap-3 justify-center">
      <AnimatePresence mode="popLayout">
        {items.map(item => (
          <motion.div
            key={item.id}
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`p-3 rounded-md border border-black/5 flex items-center gap-3 shadow-xs ${item.color}`}
          >
            <div className="w-4 h-4 rounded-full bg-black/10" />
            <div className="h-2 w-20 bg-black/10 rounded-full" />
            <span className="text-xs text-gray-500 font-sans ml-auto">{item.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
