'use client'

import Marquee from 'react-fast-marquee'

const techStack = [
  {
    name: 'Next.js',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 394 80" fill="currentColor" className="w-10 h-10 md:w-[50px] md:h-[50px]">
        <path d="M262 0h68.5v12.7h-27.2v66.6h-13.6V12.7H262V0zm81.1 0h-17.8l63.8 79.4h17.9l-32-39.7 32-39.6h-17.9l-23 28.6-23-28.6zm-78.7 0L152.9 80h15.5l20.4-25.4L209.1 80h15.5l-111.5-80h-15.4zm-30.1 0H0v12.7h68.6v12.6H17.1v11.4h51.5v12.6H17.1V79.3h68.6V0H134.3z" />
      </svg>
    ),
  },
  {
    name: 'React',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 md:w-[50px] md:h-[50px]">
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <ellipse cx="12" cy="12" rx="11" ry="4.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="11" ry="4.2" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="11" ry="4.2" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(-60 12 12)" />
      </svg>
    ),
  },
  {
    name: 'Tailwind',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 33" fill="currentColor" className="w-10 h-10 md:w-[50px] md:h-[50px]">
        <path d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 15.2 40.5 15.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 4.31 33.692 2.2 27 2.2zm-13.5 16.5c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C11.244 29.59 14.308 31.7 21 31.7c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C17.256 20.81 14.192 18.7 13.5 16.5z" />
      </svg>
    ),
  },
  {
    name: 'Framer',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[50px] h-[50px]">
        <path d="M4 0h16v8H4V0z" />
        <path d="M4 8h8l-4 4-4-4z" />
        <path d="M12 8h8v8H4l4-4 4 4z" />
      </svg>
    ),
  },
  {
    name: 'Shadcnui',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[50px] h-[50px]">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.1" />
        <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">UI</text>
      </svg>
    ),
  },
  {
    name: 'Nextui',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[50px] h-[50px]">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.1" />
        <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">UI</text>
      </svg>
    ),
  },
  {
    name: 'TS',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 md:w-[50px] md:h-[50px]">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" />
        <text x="12" y="16.5" textAnchor="middle" fontSize="9" fill="white" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif" className="dark:fill-white">TS</text>
      </svg>
    ),
  },
  {
    name: 'Vercel',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 md:w-[50px] md:h-[50px]">
        <path d="M12 2L2 22h20L12 2z" />
      </svg>
    ),
  },
]

export default function TechStack() {
  return (
    <section className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 overflow-hidden">
      <Marquee
        pauseOnHover
        pauseOnClick
        speed={50}
        gradient
        gradientColor="hsl(var(--background))"
        gradientWidth={50}
        className="w-full"
      >
        {techStack.map(tech => (
          <div key={tech.name} className="mx-3 md:mx-6 text-muted-foreground shrink-0">
            <div className="hover:opacity-100 opacity-60 dark:opacity-70 transition-all duration-300 cursor-pointer">
              {tech.icon}
            </div>
          </div>
        ))}
        {techStack.map(tech => (
          <div key={`${tech.name}-duplicate`} className="mx-3 md:mx-6 text-muted-foreground shrink-0">
            <div className="hover:opacity-100 opacity-60 dark:opacity-70 transition-all duration-300 cursor-pointer">
              {tech.icon}
            </div>
          </div>
        ))}
      </Marquee>
    </section>
  )
}
