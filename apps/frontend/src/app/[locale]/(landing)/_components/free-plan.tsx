"use client";

import { CheckIcon, PenLineIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useWorkspaceEntry } from "@/components/buss/auth-dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Highlight } from "./highlight";

const featureKeys = ["f1", "f2", "f3", "f4", "f5", "f6"] as const;

export function FreePlan() {
  const t = useTranslations("landing.free");
  const enterWorkspace = useWorkspaceEntry();

  return (
    <section
      id="free"
      className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 pt-16 sm:px-6"
    >
      <div className="flex max-w-xl flex-col text-center">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-5xl">
          <Highlight>{t("title")}</Highlight>
        </h2>
        <h3 className="mt-2 text-4xl font-medium tracking-tight">{t("title2")}</h3>
        <p className="mt-4 text-lg text-muted-foreground">{t("description")}</p>
      </div>
      <Card className="mt-10 w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("planName")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="flex items-baseline gap-1">
            <span className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-4xl font-semibold tracking-tight text-transparent">
              {t("price")}
            </span>
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {featureKeys.map((key) => (
              <li key={key} className="flex items-center gap-2">
                <CheckIcon className="size-4 text-primary" />
                <span className="text-muted-foreground">{t(`features.${key}`)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg" onClick={() => void enterWorkspace()}>
            <PenLineIcon data-icon="inline-start" />
            {t("cta")}
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
