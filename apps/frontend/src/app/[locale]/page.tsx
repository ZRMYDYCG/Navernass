import { Cta } from "@/components/landing/cta";
import { Faq } from "@/components/landing/faq";
import { FreePlan } from "@/components/landing/free-plan";
import { Hero } from "@/components/landing/hero";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <FreePlan />
        <Faq />
        <Cta />
      </main>
      <LandingFooter />
    </div>
  );
}
