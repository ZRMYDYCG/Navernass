import { PenLineIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function Cta() {
  const t = useTranslations("landing.cta");

  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-12 px-4 py-16 sm:px-6">
      <div className="flex max-w-2xl flex-col gap-4 text-center">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-5xl">{t("title")}</h2>
        <p className="text-lg text-muted-foreground">{t("description")}</p>
        <p className="font-serif text-xl text-muted-foreground italic">{t("quote")}</p>
      </div>
      <Button size="lg" render={<Link href="/workspace" />}>
        <PenLineIcon data-icon="inline-start" />
        {t("button")}
      </Button>
    </section>
  );
}
