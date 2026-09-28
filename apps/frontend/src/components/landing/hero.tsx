import { PenLineIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

import { LineText } from "./line-text";

export function Hero() {
  const t = useTranslations("landing.hero");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-16 pb-16 text-center sm:px-6 md:pt-24 lg:px-8">
      <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-6xl sm:tracking-widest">
        {t("title1")} <LineText>{t("title2")}</LineText>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-xl tracking-tight text-muted-foreground sm:text-2xl">
        {t("description")}
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button size="lg" render={<Link href="/workspace" />}>
          <PenLineIcon data-icon="inline-start" />
          {t("cta")}
        </Button>
        <Button variant="outline" size="lg" render={<a href="#faq" />}>
          {t("secondary")}
        </Button>
      </div>
    </section>
  );
}
