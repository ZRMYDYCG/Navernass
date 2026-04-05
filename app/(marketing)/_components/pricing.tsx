import { Check } from 'lucide-react'
import { Highlighter } from '@/components/ui/highlighter'
import { useI18n } from '@/hooks/use-i18n'

export function Pricing() {
  const { t } = useI18n()

  const plans = [
    {
      name: t('marketing.pricing.free.name'),
      price: t('marketing.pricing.free.price'),
      description: t('marketing.pricing.free.description'),
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
      features: [
        t('marketing.pricing.pro.features.1'),
        t('marketing.pricing.pro.features.2'),
        t('marketing.pricing.pro.features.3'),
        t('marketing.pricing.pro.features.4'),
      ],
      highlighted: true,
    },
    {
      name: t('marketing.pricing.team.name'),
      price: t('marketing.pricing.team.price'),
      description: t('marketing.pricing.team.description'),
      features: [
        t('marketing.pricing.team.features.1'),
        t('marketing.pricing.team.features.2'),
        t('marketing.pricing.team.features.3'),
        t('marketing.pricing.team.features.4'),
      ],
      highlighted: false,
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
              className={`relative flex flex-col p-6 md:p-8 rounded-2xl border transition-all duration-300
                ${
                  plan.highlighted
                    ? 'border-primary/50 shadow-paper-md bg-card/80 scale-100 md:scale-105 z-10'
                    : 'border-border/50 shadow-paper-sm bg-card/40 hover:bg-card/60'
                }
              `}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                    {t('marketing.pricing.badge')}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-medium text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.price !== '免费' && plan.price !== 'Free' && plan.price !== '0' && (
                    <span className="text-sm text-muted-foreground">/mo</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground min-h-[40px]">{plan.description}</p>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3 text-sm text-foreground/80">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${
                    plan.highlighted
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }
                `}
              >
                {t('marketing.pricing.cta')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
