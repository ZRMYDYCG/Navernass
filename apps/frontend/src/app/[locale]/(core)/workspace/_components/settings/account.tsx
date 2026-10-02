"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { uploadFile } from "@/lib/http/modules/storage.api";
import { imageContentTypes } from "@/lib/http/modules/storage.schema";
import { useSession, useUpdateUser } from "@/servers/auth.server";

export function Account() {
  const t = useTranslations("settings.account");
  const session = useSession();
  const updateUser = useUpdateUser();
  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => updateUser.mutateAsync({ image: await uploadFile(file) }),
  });
  const fileInput = useRef<HTMLInputElement>(null);
  const user = session.data?.user;

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const displayName = user.name || user.email;
  const error = uploadAvatar.error ?? updateUser.error;
  const busy = uploadAvatar.isPending || updateUser.isPending;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      <section className="flex flex-col gap-3">
        <h3 className="px-1 text-sm font-medium text-muted-foreground">{t("profile")}</h3>
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
          <div className="flex items-center justify-between gap-6 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar size="lg">
                {user.image ? <AvatarImage src={user.image} alt={displayName} /> : null}
                <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium">{t("avatar.title")}</span>
                <span className="text-xs text-muted-foreground">{t("avatar.description")}</span>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {user.image ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => updateUser.mutate({ image: null })}
                >
                  {t("avatar.remove")}
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => fileInput.current?.click()}
              >
                {uploadAvatar.isPending ? <Spinner /> : null}
                {t("avatar.upload")}
              </Button>
              <input
                ref={fileInput}
                type="file"
                accept={imageContentTypes.join(",")}
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  // 清空后再次选择同一文件也能触发 change。
                  event.target.value = "";
                  if (file) uploadAvatar.mutate(file);
                }}
              />
            </div>
          </div>
          <form
            className="flex items-center justify-between gap-6 px-4 py-3"
            onSubmit={(event) => {
              event.preventDefault();
              const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
              if (name && name !== user.name) updateUser.mutate({ name });
            }}
          >
            <label htmlFor="account-name" className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-medium">{t("name.title")}</span>
              <span className="text-xs text-muted-foreground">{t("name.description")}</span>
            </label>
            <div className="flex shrink-0 gap-2">
              <Input
                key={user.name}
                id="account-name"
                name="name"
                defaultValue={user.name ?? ""}
                required
                maxLength={64}
                className="w-48"
              />
              <Button type="submit" size="sm" disabled={busy}>
                {t("name.save")}
              </Button>
            </div>
          </form>
          <div className="flex items-center justify-between gap-6 px-4 py-3">
            <span className="text-sm font-medium">{t("email")}</span>
            <span className="truncate text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
        {error ? <FieldError>{error.message}</FieldError> : null}
      </section>
    </div>
  );
}
