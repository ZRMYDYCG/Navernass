'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { User, Tag, BookOpen, Sparkles, GripHorizontal } from 'lucide-react'
import Image from 'next/image'

export interface Character {
  id: string
  name: string
  role: string
  avatar?: string
  description: string
  traits: string[]
  keywords: string[]
  chapters: string[]
  note?: string
}

interface CharacterCardProps {
  character: Character
  onClick?: () => void
  className?: string
}

export function CharacterCard({ character, onClick, className }: CharacterCardProps) {
  return (
    <motion.div
      whileHover={{ 
        y: -4, 
        rotate: 0.5,
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)"
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        "group relative w-full cursor-pointer overflow-hidden",
        "bg-[#fdfbf7]/90 dark:bg-zinc-800/90 backdrop-blur-sm",
        "border border-stone-200/50 dark:border-stone-700/30",
        "shadow-[2px_2px_10px_-2px_rgba(0,0,0,0.05)]",
        "rounded-sm",
        className
      )}
      style={{
        boxShadow: "1px 1px 2px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.01) inset" 
      }}
    >
      <div className="absolute inset-0 bg-paper-texture opacity-40 pointer-events-none z-0" />

      {character.chapters.length > 0 && (
        <div className="absolute -top-1 -right-1 z-20">
          <div className="relative">
            <div className="absolute inset-0 bg-slate-800/10 dark:bg-slate-200/10 rotate-3 transform skew-x-12 rounded-sm blur-[0.5px]" />
            <div className="relative px-2.5 py-0.5 bg-[#f1f5f9] dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 shadow-sm transform rotate-3 origin-top-right rounded-bl-md rounded-tr-md">
              <span className="text-[10px] font-handwriting text-slate-600 dark:text-slate-400 font-bold tracking-wide">
                {character.chapters[0]} 登场
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 p-5 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0 w-16 h-16 overflow-hidden rounded-full border-2 border-stone-100 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 shadow-inner">
            {character.avatar ? (
              <Image 
                src={character.avatar} 
                alt={character.name}
                fill
                className="object-cover opacity-80 grayscale-[0.3] contrast-125 mix-blend-multiply dark:mix-blend-normal dark:opacity-90"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-zinc-600">
                <User className="w-8 h-8 stroke-[1.5]" />
              </div>
            )}
            <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay" />
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-handwriting text-2xl font-bold text-stone-800 dark:text-stone-100 leading-none mb-1.5 tracking-wide">
              {character.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-mono tracking-tight opacity-80">
              <span className="uppercase">{character.role}</span>
              {/* <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-600" />
              <span>{character.chapters.length} 章节</span> */}
            </div>
          </div>
        </div>

        <div className="relative">
          <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-light line-clamp-3 italic opacity-90">
            {character.description}
          </p>
          <div className="absolute -left-3 top-1 bottom-1 w-[2px] bg-stone-200 dark:bg-stone-700/50 rounded-full" />
        </div>

        <div className="flex flex-wrap gap-y-2 gap-x-4 py-1">
          {character.traits.map((trait, i) => (
            <div key={i} className="flex items-center gap-1.5 group/trait">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-500 group-hover/trait:bg-orange-300 transition-colors duration-500" />
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">{trait}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {character.keywords.map((keyword, i) => (
            <span 
              key={i} 
              className="inline-flex px-2 py-1 text-[10px] font-mono text-stone-600 dark:text-stone-300 bg-stone-100/50 dark:bg-zinc-700/30 border border-stone-200 dark:border-stone-700/50 rounded-[1px] uppercase tracking-wider shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              {keyword}
            </span>
          ))}
        </div>

        {character.note && (
          <div className="relative mt-1 mx-1">
            <div className="absolute inset-0 bg-amber-900/5 dark:bg-black/20 translate-y-1 translate-x-1 rounded-sm rotate-1 blur-sm" />
            <div className="relative bg-[#fffdf5] dark:bg-[#2c241b] p-3 rounded-sm shadow-sm border border-amber-100/50 dark:border-amber-900/30 rotate-1 transform transition-transform duration-300 group-hover:rotate-0">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/40 dark:bg-white/10 backdrop-blur-sm rotate-[-2deg] shadow-sm" />
              
              <div className="flex gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400/70 mt-0.5 shrink-0" />
                <p className="text-xs font-handwriting text-stone-600 dark:text-stone-300 leading-5">
                  {character.note}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-stone-200/30 to-transparent" />
    </motion.div>
  )
}

