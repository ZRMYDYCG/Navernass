'use client'

import { motion } from 'framer-motion'

export default function CharacterPreview() {
  return (
    <div className="w-full h-full relative bg-stone-50 rounded-xl overflow-hidden p-4 flex items-center justify-center">

      {/* Connecting Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <motion.line
          x1="25%"
          y1="25%"
          x2="75%"
          y2="75%"
          stroke="#cbd5e1" // 柔和灰蓝
          strokeWidth="2"
          strokeDasharray="4 4"
          animate={{ strokeDashoffset: [0, 8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.line
          x1="75%"
          y1="25%"
          x2="25%"
          y2="75%"
          stroke="#cbd5e1"
          strokeWidth="2"
          strokeDasharray="4 4"
          animate={{ strokeDashoffset: [8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </svg>

      {/* Nodes */}
      <motion.div
        animate={{ y: [0, -6, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[20%] left-[20%] w-12 h-12 bg-white rounded-full shadow-lg border border-stone-200 flex items-center justify-center text-xs font-serif font-bold text-stone-700"
      >
        A
      </motion.div>

      <motion.div
        animate={{ y: [0, 6, 0], scale: [1, 0.95, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[20%] right-[20%] w-10 h-10 bg-stone-800 rounded-full shadow-lg flex items-center justify-center text-[10px] text-white"
      >
        B
      </motion.div>

      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[20%] right-[20%] w-8 h-8 bg-rose-100 rounded-full shadow-md border border-rose-200"
      />

      <motion.div
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[20%] left-[20%] w-6 h-6 bg-blue-100 rounded-full shadow-md border border-blue-200"
      />
    </div>
  )
}
