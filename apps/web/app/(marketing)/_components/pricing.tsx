import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

type PricingPlan = {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
  frozen?: boolean
  badge?: string
  cta?: string
  priceIsFree?: boolean
  priceHint?: string
}

export function Pricing() {
  const { t } = useI18n()

  const plans: PricingPlan[] = [
    {
      name: t('marketing.pricing.free.name'),
      price: t('marketing.pricing.free.price'),
      description: t('marketing.pricing.free.description'),
      priceIsFree: true,
      features: [
        t('marketing.pricing.free.features.1'),
        t('marketing.pricing.free.features.2'),
        t('marketing.pricing.free.features.3'),
        t('marketing.pricing.free.features.4'),
      ],
      highlighted: false,
    },
    {
      name: t('marketing.pricing.pro.name'),
      price: t('marketing.pricing.pro.price'),
      description: t('marketing.pricing.pro.description'),
      priceIsFree: true,
      features: [
        t('marketing.pricing.pro.features.1'),
        t('marketing.pricing.pro.features.2'),
        t('marketing.pricing.pro.features.3'),
        t('marketing.pricing.pro.features.4'),
      ],
      highlighted: true,
      badge: t('marketing.pricing.badge'),
      cta: t('marketing.pricing.cta'),
    },
    {
      name: t('marketing.pricing.subscription.name'),
      price: t('marketing.pricing.subscription.price'),
      priceHint: t('marketing.pricing.subscription.priceHint'),
      description: t('marketing.pricing.subscription.description'),
      features: [
        t('marketing.pricing.subscription.features.1'),
        t('marketing.pricing.subscription.features.2'),
        t('marketing.pricing.subscription.features.3'),
        t('marketing.pricing.subscription.features.4'),
      ],
      frozen: true,
      badge: t('marketing.pricing.previewBadge'),
      cta: t('marketing.pricing.ctaFrozen'),
    },
  ]

  return (
    <section className="flex flex-col items-center relative overflow-hidden bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground/80 tracking-wide">
            {t('marketing.pricing.title')}
          </h2>
          <p className="mt-4 text-sm font-serif italic text-foreground/50 max-w-xl mx-auto leading-relaxed">
            {t('marketing.pricing.subtitle')}
          </p>
          <div className="mt-8 w-14 h-[1.5px] bg-foreground/10 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={cn(
                'relative flex flex-col p-6 md:p-8 rounded-2xl border transition-all duration-300',
                plan.frozen
                  ? 'border border-dashed border-border bg-card/70 shadow-paper-sm'
                  : plan.highlighted
                    ? 'border-primary/50 shadow-paper-md bg-card/80 scale-100 md:scale-105 z-10'
                    : 'border-border/50 shadow-paper-sm bg-card/40 hover:bg-card/60',
              )}
              aria-disabled={plan.frozen || undefined}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <span
                    className={cn(
                      'text-xs font-medium px-3 py-1 rounded-full shadow-sm tracking-wide',
                      plan.frozen
                        ? 'bg-muted text-muted-foreground border border-border'
                        : 'bg-primary text-primary-foreground',
                    )}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="relative mb-6">
                <h3 className="text-xl font-medium text-foreground mb-2">{plan.name}</h3>
                <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span
                    className={cn(
                      'font-bold text-foreground',
                      plan.frozen ? 'text-3xl' : 'text-4xl',
                    )}
                  >
                    {plan.price}
                  </span>
                  {plan.priceHint && (
                    <span className="text-xs font-medium text-muted-foreground rounded-full border border-border bg-muted/50 px-2 py-0.5">
                      {plan.priceHint}
                    </span>
                  )}
                  {!plan.priceIsFree && !plan.frozen && (
                    <span className="text-sm text-muted-foreground">/mo</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground min-h-[40px] leading-relaxed">{plan.description}</p>
              </div>

              <ul className="flex-1 space-y-2.5 mb-8 text-sm text-foreground/85 leading-relaxed">
                {plan.features.map((feature, j) => (
                  <li key={j} className="pl-3 border-l-2 border-border/80">
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={plan.frozen}
                aria-disabled={plan.frozen}
                className={cn(
                  'w-full py-2.5 rounded-lg text-sm font-medium transition-colors',
                  plan.frozen
                    ? 'cursor-not-allowed bg-muted/80 text-muted-foreground border border-border'
                    : plan.highlighted
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                )}
              >
                {plan.cta ?? t('marketing.pricing.cta')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
