"use client";

import { hasLocale, useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

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

import { SettingsCard, SettingsGroup, SettingsRow } from "./settings-ui";

const themeOptions = ["system", ...themes] as const;

const localeLabels: Record<(typeof routing.locales)[number], string> = {
  "zh-CN": "简体中文",
  "en-US": "English",
};

// useSyncExternalStore 需要订阅函数；这里只关心首次客户端渲染，没有可订阅的来源。
const subscribeNoop = () => () => {};

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
    <SettingsRow title={t("title")} description={t("description")}>
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
    </SettingsRow>
  );
}

function LanguageRow() {
  const t = useTranslations("settings.general.language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SettingsRow title={t("title")} description={t("description")}>
      <RowSelect
        label={t("title")}
        options={routing.locales.map((value) => ({ value, label: localeLabels[value] }))}
        value={locale}
        onValueChange={(value) => {
          if (!hasLocale(routing.locales, value) || value === locale) return;
          router.replace(pathname, { locale: value });
        }}
      />
    </SettingsRow>
  );
}

export function GeneralSettings() {
  const t = useTranslations("settings.general");

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      <SettingsGroup title={t("preferences")}>
        <SettingsCard className="divide-y divide-border">
          <ThemeRow />
          <LanguageRow />
        </SettingsCard>
      </SettingsGroup>
    </div>
  );
}
