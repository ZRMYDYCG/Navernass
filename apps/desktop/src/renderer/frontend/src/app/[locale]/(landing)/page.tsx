import { AuthDialogProvider } from "@/components/buss/auth-dialog";

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
        </main>
        <LandingFooter />
      </div>
    </AuthDialogProvider>
  );
}
