"use client";

import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import {
  Blocks,
  Braces,
  CheckCircle2,
  DatabaseZap,
  Languages,
  Minus,
  Plus,
  RefreshCw,
  RotateCcw,
  Send,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { starterStatusOptions } from "@/lib/query/starter-query";
import {
  selectCount,
  selectCounterActions,
  selectDensity,
  selectSetDensity,
} from "@/store/selectors";
import { useAppStore } from "@/store/app.store";

const projectSchema = z.object({
  name: z.string().trim().min(2, "名称至少需要 2 个字符").max(32),
});

const stack = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS 4",
  "shadcn/ui",
  "TanStack",
  "Zustand + Immer",
  "Zod",
  "next-intl",
  "Ky",
];

export function StarterScreen() {
  const t = useTranslations("home");
  const locale = useLocale();
  const [submittedName, setSubmittedName] = useState("");
  const count = useAppStore(selectCount);
  const { increment, decrement, reset } = useAppStore(useShallow(selectCounterActions));
  const density = useAppStore(selectDensity);
  const setDensity = useAppStore(selectSetDensity);
  const statusQuery = useQuery(starterStatusOptions());

  const form = useForm({
    defaultValues: { name: "" },
    validators: { onSubmit: projectSchema },
    onSubmit: async ({ value }) => {
      setSubmittedName(value.name);
    },
  });

  return (
    <main
      className={
        density === "compact"
          ? "mx-auto min-h-dvh w-full max-w-6xl px-4 py-6"
          : "mx-auto min-h-dvh w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-16"
      }
    >
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl space-y-4">
          <Badge variant="secondary">{t("eyebrow")}</Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {t("description")}
          </p>
        </div>
        <Button
          variant="outline"
          render={<Link href="/" locale={locale === "zh-CN" ? "en-US" : "zh-CN"} />}
        >
          <Languages data-icon="inline-start" />
          {t("language")}
        </Button>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Blocks className="size-4 text-primary" />
              {t("stackTitle")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stack.map((item) => (
              <Badge key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <DatabaseZap className="size-4 text-primary" />
                {t("counterTitle")}
              </span>
            </CardTitle>
            <CardDescription>{t("counterDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="flex items-center justify-center rounded-xl bg-muted py-8 text-5xl font-semibold tabular-nums">
                {count}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={decrement}>
                  <Minus data-icon="inline-start" />
                  {t("decrease")}
                </Button>
                <Button variant="outline" onClick={reset}>
                  <RotateCcw data-icon="inline-start" />
                  {t("reset")}
                </Button>
                <Button onClick={increment}>
                  <Plus data-icon="inline-start" />
                  {t("increase")}
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">{t("themeLabel")}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={density === "comfortable" ? "secondary" : "ghost"}
                    onClick={() => setDensity("comfortable")}
                  >
                    {t("comfortable")}
                  </Button>
                  <Button
                    size="sm"
                    variant={density === "compact" ? "secondary" : "ghost"}
                    onClick={() => setDensity("compact")}
                  >
                    {t("compact")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Braces className="size-4 text-primary" />
                {t("formTitle")}
              </span>
            </CardTitle>
            <CardDescription>{t("formDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void form.handleSubmit();
              }}
            >
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>{t("name")}</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder={t("namePlaceholder")}
                      aria-invalid={field.state.meta.errors.length > 0}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={String(error)} className="text-sm text-destructive">
                        {typeof error === "object" && error && "message" in error
                          ? String(error.message)
                          : String(error)}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit || isSubmitting}>
                    <Send data-icon="inline-start" />
                    {t("submit")}
                  </Button>
                )}
              </form.Subscribe>
              {submittedName ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary" />
                  {t("submitted", { name: submittedName })}
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("queryTitle")}</CardTitle>
            <CardDescription>{t("queryDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="size-2 rounded-full bg-chart-2" aria-hidden="true" />
                {statusQuery.isPending ? t("loading") : t("queryReady")}
              </div>
              <Button
                variant="outline"
                disabled={statusQuery.isFetching}
                onClick={() => void statusQuery.refetch()}
              >
                <RefreshCw
                  data-icon="inline-start"
                  className={statusQuery.isFetching ? "animate-spin" : undefined}
                />
                {t("refresh")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("requestTitle")}</CardTitle>
            <CardDescription>{t("requestDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-muted p-4 font-mono text-sm text-muted-foreground">
              apiRequest(input, responseSchema, options)
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
