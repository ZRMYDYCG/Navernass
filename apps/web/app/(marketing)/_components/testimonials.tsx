'use client'

import Marquee from 'react-fast-marquee'
import { useI18n } from '@/hooks/use-i18n'

interface Testimonial {
  name: string
  role: string
  content: string
}

export function Testimonials() {
  const { t } = useI18n()
  const rawReviews = t('marketing.testimonials.reviews', { returnObjects: true }) as unknown
  const reviews: Testimonial[] = Array.isArray(rawReviews) ? rawReviews : []

  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground/80 tracking-wide">
            {t('marketing.testimonials.title')}
          </h2>
          <p className="mt-4 text-sm font-serif italic text-foreground/50 max-w-xl mx-auto leading-relaxed">
            {t('marketing.testimonials.subtitle')}
          </p>
          <div className="mt-8 w-14 h-[1.5px] bg-foreground/10 mx-auto rounded-full" />
        </div>

        {reviews.length > 0 && (
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
            <Marquee gradient={true} gradientColor="hsl(var(--background))" speed={40} pauseOnHover={true} className="py-4 overflow-y-hidden">
              {reviews.map((review, i) => (
                <div
                  key={i}
                  className="mx-4 flex h-[220px] w-[320px] md:w-[400px] flex-col gap-4 rounded-2xl border border-border/50 bg-card/40 p-6 shadow-paper-sm transition-all hover:bg-card/80"
                >
                  <p className="text-sm leading-relaxed text-foreground/80">
                    "
                    {review.content}
                    "
                  </p>
                  <div className="mt-auto flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                      {review.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{review.name}</span>
                      <span className="text-xs text-muted-foreground">{review.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </Marquee>
          </div>
        )}
      </div>
    </section>
  )
}
