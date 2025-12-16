import type { BentoCardProps } from '@/app/(marketing)/types'
import { motion } from 'framer-motion'

export default function BentoCard({
  colSpan = '',
  title,
  subtitle,
  description,
  icon: Icon,
  preview,
  theme,
  contentRight = false,
}: BentoCardProps) {
  const themeColors = {
    blue: 'group-hover:bg-blue-50/50 group-hover:border-blue-100 dark:group-hover:bg-yellow-800/20 dark:group-hover:border-yellow-700/50',
    amber: 'group-hover:bg-amber-50/50 group-hover:border-amber-100 dark:group-hover:bg-yellow-800/20 dark:group-hover:border-yellow-700/50',
    indigo: 'group-hover:bg-indigo-50/50 group-hover:border-indigo-100 dark:group-hover:bg-yellow-800/20 dark:group-hover:border-yellow-700/50',
    stone: 'group-hover:bg-stone-50/50 group-hover:border-stone-100 dark:group-hover:bg-yellow-800/20 dark:group-hover:border-yellow-700/50',
    green: 'group-hover:bg-emerald-50/50 group-hover:border-emerald-100 dark:group-hover:bg-yellow-800/20 dark:group-hover:border-yellow-700/50',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      className={`
        ${colSpan}
        group relative rounded-3xl bg-background dark:bg-yellow-900/10 border border-border dark:border-yellow-800/30 shadow-[0_2px_20px_rgba(0,0,0,0.02)]
        dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]
        overflow-hidden flex flex-col transition-all duration-500
        hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1
        ${themeColors[theme]}
      `}
    >
      {/* Content Layout */}
      <div className={`flex flex-col h-full ${contentRight ? 'flex-row' : ''}`}>

        {/* Preview Area */}
        <div className={`
          ${contentRight ? 'w-1/2 h-full' : 'h-[55%] w-full'}
          p-6 flex items-center justify-center relative
        `}
        >
          <div className="w-full h-full relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
            {preview}
          </div>
          {/* Subtle Backglow */}
          <div className={`absolute inset-0 bg-linear-to-b from-gray-50/50 to-transparent opacity-50 dark:from-yellow-900/20 dark:opacity-40 ${contentRight ? 'bg-linear-to-r' : ''}`} />
        </div>

        {/* Text Area */}
        <div className={`
          ${contentRight ? 'w-1/2 p-8 flex flex-col justify-center' : 'h-[45%] p-6 flex flex-col justify-center'}
          relative z-20 bg-background/50 dark:bg-yellow-900/20 backdrop-blur-sm
        `}
        >
          <div className="mb-auto">
            {(subtitle || Icon) && (
              <div className="flex items-center gap-2 mb-2">
                {Icon && (
                  <div className={`p-2 rounded-lg bg-gray-50 dark:bg-yellow-800/30 text-foreground/80 ${themeColors[theme].replace('group-hover:', '')}`}>
                    <Icon size={18} />
                  </div>
                )}
                {subtitle && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 font-sans">{subtitle}</span>
                )}
              </div>
            )}
            <h3 className="font-serif text-xl font-bold text-foreground mb-2 line-clamp-2">{title}</h3>
            <p className="text-sm text-foreground/60 leading-relaxed font-sans line-clamp-4">{description}</p>
          </div>
        </div>

      </div>
    </motion.div>
  )
}
