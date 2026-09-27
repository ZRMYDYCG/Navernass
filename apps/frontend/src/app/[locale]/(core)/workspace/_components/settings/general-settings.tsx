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

const subscribeNothing = () => () => {};

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-4 py-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ThemeSelect() {
  const t = useTranslations("settings.general.theme");
  const { theme, setTheme } = useTheme();
  // next-themes 只在客户端知道当前主题，服务端渲染时先占位避免水合不一致。
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

  if (!mounted) return <Skeleton className="h-7 w-28" />;

  const items = themeOptions.map((value) => ({ value, label: t(`options.${value}`) }));

  return (
    <Select items={items} value={theme} onValueChange={(value) => value && setTheme(value)}>
      <SelectTrigger size="sm" aria-label={t("title")} className="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function LanguageSelect() {
  const t = useTranslations("settings.general.language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const items = routing.locales.map((value) => ({ value, label: localeLabels[value] }));

  return (
    <Select
      items={items}
      value={locale}
      onValueChange={(value) => {
        if (!hasLocale(routing.locales, value) || value === locale) return;
        router.replace(`${pathname}${window.location.search}`, { locale: value });
      }}
    >
      <SelectTrigger size="sm" aria-label={t("title")} className="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function GeneralSettings() {
  const t = useTranslations("settings.general");

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      <section className="flex flex-col gap-2">
        <h3 className="px-1 text-xs font-medium text-muted-foreground">{t("preferences")}</h3>
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
          <SettingRow title={t("theme.title")} description={t("theme.description")}>
            <ThemeSelect />
          </SettingRow>
          <SettingRow title={t("language.title")} description={t("language.description")}>
            <LanguageSelect />
          </SettingRow>
        </div>
      </section>
    </div>
  );
}
