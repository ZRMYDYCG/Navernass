import { AuthDialogProvider } from "@/components/auth/auth-dialog";

import { Cta } from "./_components/cta";
import { Faq } from "./_components/faq";
import { FreePlan } from "./_components/free-plan";
import { Hero } from "./_components/hero";
import { LandingFooter } from "./_components/landing-footer";
import { LandingHeader } from "./_components/landing-header";

export default function LandingPage() {
  return (
    <AuthDialogProvider>
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
    </AuthDialogProvider>
  );
}
