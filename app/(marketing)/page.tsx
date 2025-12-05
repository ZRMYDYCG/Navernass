import CTA from './_components/cta'
import Features from './_components/features'
import Hero from './_components/hero'

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary-foreground">
      <Hero />
      <Features />
      <CTA />
    </main>
  )
}
