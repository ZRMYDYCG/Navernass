"use client";

import { hasLocale, useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSyncExternalStore, type ReactNode } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { themes } from "@/providers/theme-provider";

const themeOptions = ["system", ...themes] as const;

const localeLabels: Record<(typeof routing.locales)[number], string> = {
  "zh-CN": "简体中文",
  "en-US": "English",
};

// useSyncExternalStore 需要订阅函数；这里只关心首次客户端渲染，没有可订阅的来源。
const subscribeNoop = () => () => {};

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-4 py-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        {description ? <span className="text-xs text-muted-foreground">{description}</span> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

function RowSelect({
  label,
  options,
  value,
  onValueChange,
}: {
  label: string;
  options: SelectOption[];
  value: string | undefined;
  onValueChange: (value: string) => void;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(nextValue) => {
        if (typeof nextValue === "string") onValueChange(nextValue);
      }}
    >
      <SelectTrigger size="sm" aria-label={label} className="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ThemeRow() {
  const t = useTranslations("settings.general.theme");
  const { theme, setTheme } = useTheme();
  // next-themes 只在客户端知道当前主题，服务端渲染时先占位避免水合不一致。
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  return (
    <Row title={t("title")} description={t("description")}>
      {mounted ? (
        <RowSelect
          label={t("title")}
          options={themeOptions.map((value) => ({ value, label: t(`options.${value}`) }))}
          value={theme}
          onValueChange={setTheme}
        />
      ) : (
        <Skeleton className="h-7 w-28" />
      )}
    </Row>
  );
}

function LanguageRow() {
  const t = useTranslations("settings.general.language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Row title={t("title")} description={t("description")}>
      <RowSelect
        label={t("title")}
        options={routing.locales.map((value) => ({ value, label: localeLabels[value] }))}
        value={locale}
        onValueChange={(value) => {
          if (!hasLocale(routing.locales, value) || value === locale) return;
          router.replace(pathname, { locale: value });
        }}
      />
    </Row>
  );
}

export function General() {
  const t = useTranslations("settings.general");

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      <section className="flex flex-col gap-3">
        <h3 className="px-1 text-sm font-medium text-muted-foreground">{t("preferences")}</h3>
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
          <ThemeRow />
          <LanguageRow />
        </div>
      </section>
    </div>
  );
}
