import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function LandingFooter() {
  const t = useTranslations("landing.footer");

  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <Image src="/logo.png" alt="Narraverse Logo" className="size-6" width={24} height={24} />
          Narraverse
        </Link>
        <p>{t("tagline")}</p>
        <p>
          ©{new Date().getFullYear()} Narraverse. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
