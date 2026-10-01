"use client";

import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Highlight } from "./highlight";

const questionKeys = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

export function Faq() {
  const t = useTranslations("landing.faq");

  return (
    <section
      id="faq"
      className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-12 px-4 py-16 sm:px-6"
    >
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-5xl">
          <Highlight>{t("title")}</Highlight>
        </h2>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>
      <Accordion>
        {questionKeys.map((key) => (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger>{t(`items.${key}.title`)}</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">{t(`items.${key}.content`)}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
