'use client'

import { SiFramer, SiNextdotjs, SiReact, SiShadcnui, SiTailwindcss, SiTypescript, SiVercel } from 'react-icons/si'
import LogoLoop from '@/components/LogoLoop'

const techLogos = [
  {
    node: <SiReact className="w-12 h-12" />,
    title: 'React',
    href: 'https://react.dev',
    ariaLabel: 'React',
  },
  {
    node: <SiNextdotjs className="w-12 h-12" />,
    title: 'Next.js',
    href: 'https://nextjs.org',
    ariaLabel: 'Next.js',
  },
  {
    node: <SiTypescript className="w-12 h-12" />,
    title: 'TypeScript',
    href: 'https://www.typescriptlang.org',
    ariaLabel: 'TypeScript',
  },
  {
    node: <SiTailwindcss className="w-12 h-12" />,
    title: 'Tailwind CSS',
    href: 'https://tailwindcss.com',
    ariaLabel: 'Tailwind CSS',
  },
  {
    node: <SiFramer className="w-12 h-12" />,
    title: 'Framer Motion',
    href: 'https://www.framer.com/motion',
    ariaLabel: 'Framer Motion',
  },
  {
    node: <SiShadcnui className="w-12 h-12" />,
    title: 'shadcn/ui',
    href: 'https://ui.shadcn.com',
    ariaLabel: 'shadcn/ui',
  },
  {
    node: <SiVercel className="w-12 h-12" />,
    title: 'Vercel',
    href: 'https://vercel.com',
    ariaLabel: 'Vercel',
  },
]

export default function TechStack() {
  return (
    <section className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 overflow-hidden">
      <div className="h-20 relative">
        <LogoLoop
          logos={techLogos}
          speed={80}
          direction="left"
          logoHeight={48}
          gap={48}
          pauseOnHover
          hoverSpeed={20}
          scaleOnHover
          fadeOut
          fadeOutColor="hsl(var(--background))"
          ariaLabel="Technology stack"
        />
      </div>
    </section>
  )
}
