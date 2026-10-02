"use client";

import { useMutation } from "@tanstack/react-query";
import { CameraIcon, XIcon } from "lucide-react";
import { hasLocale, useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSyncExternalStore, useRef, useState, type ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { uploadFile } from "@/lib/http/modules/storage.api";
import { imageContentTypes } from "@/lib/http/modules/storage.schema";
import { themes } from "@/providers/theme-provider";
import { useSession, useUpdateUser } from "@/servers/auth.server";

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

/** 头像即上传入口：悬停出现相机遮罩，已有头像时右上角出现移除按钮。 */
function AvatarControl({
  user,
  busy,
  onUpload,
  onRemove,
}: {
  user: { image?: string | null; name?: string | null; email: string };
  busy: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const t = useTranslations("settings.general.account");
  const fileInput = useRef<HTMLInputElement>(null);
  const displayName = user.name || user.email;

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={t("avatar")}
        disabled={busy}
        className="block cursor-pointer rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => fileInput.current?.click()}
      >
        <Avatar size="lg">
          {user.image ? <AvatarImage src={user.image} alt={displayName} /> : null}
          <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/60 text-background opacity-0 transition-opacity group-hover:opacity-100">
          <CameraIcon className="size-3.5" />
        </span>
      </button>
      {user.image ? (
        <button
          type="button"
          aria-label={t("remove")}
          disabled={busy}
          className="absolute -top-1 -right-1 flex size-4.5 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:outline-hidden"
          onClick={onRemove}
        >
          <XIcon className="size-2.5" />
        </button>
      ) : null}
      <input
        ref={fileInput}
        type="file"
        accept={imageContentTypes.join(",")}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          // 清空后再次选择同一文件也能触发 change。
          event.target.value = "";
          if (file) onUpload(file);
        }}
      />
    </div>
  );
}

/** 昵称行内编辑：失焦或回车即保存，无独立保存按钮。 */
function NameInput({
  name,
  busy,
  onSave,
}: {
  name: string;
  busy: boolean;
  onSave: (name: string) => void;
}) {
  const [value, setValue] = useState(name);

  const save = () => {
    const next = value.trim();
    if (!next || next === name) {
      setValue(name);
      return;
    }
    onSave(next);
  };

  return (
    <Input
      aria-label="name"
      value={value}
      disabled={busy}
      maxLength={64}
      className="w-48"
      onChange={(event) => setValue(event.target.value)}
      onBlur={save}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    />
  );
}

function AccountSection() {
  const t = useTranslations("settings.general.account");
  const session = useSession();
  const updateUser = useUpdateUser();
  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => updateUser.mutateAsync({ image: await uploadFile(file) }),
  });
  const user = session.data?.user;
  const error = uploadAvatar.error ?? updateUser.error;
  const busy = uploadAvatar.isPending || updateUser.isPending;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="px-1 text-sm font-medium text-muted-foreground">{t("title")}</h3>
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
        {user ? (
          <>
            <Row title={t("avatar")}>
              <AvatarControl
                user={user}
                busy={busy}
                onUpload={(file) => uploadAvatar.mutate(file)}
                onRemove={() => updateUser.mutate({ image: null })}
              />
            </Row>
            <Row title={t("name")}>
              <NameInput
                name={user.name ?? ""}
                busy={busy}
                onSave={(name) => updateUser.mutate({ name })}
              />
            </Row>
            <Row title={t("email")}>
              <span className="truncate text-sm text-muted-foreground">{user.email}</span>
            </Row>
          </>
        ) : (
          <div className="p-4">
            <Skeleton className="h-16 w-full" />
          </div>
        )}
      </div>
      {error ? <FieldError>{error.message}</FieldError> : null}
    </section>
  );
}

export function General() {
  const t = useTranslations("settings.general");

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      <AccountSection />
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
