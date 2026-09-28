"use client";

import { Loader2Icon, LogInIcon, UserPlusIcon } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { signInEmail, signUpEmail } from "@/lib/api/auth.api";

type AuthMode = "login" | "register";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/workspace";
  return value;
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    try {
      if (isRegister) await signUpEmail({ name, email, password });
      else await signInEmail({ email, password });
      window.location.assign(safeNext(searchParams.get("next")));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("error"));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="mx-auto flex items-center gap-2 text-lg font-semibold">
          <Image src="/logo.png" alt="Narraverse Logo" width={32} height={32} className="size-8" />
          <span>Narraverse</span>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>{t(`${mode}.title`)}</CardTitle>
            <CardDescription>{t(`${mode}.description`)}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-5" onSubmit={onSubmit}>
              <FieldGroup>
                {isRegister ? (
                  <Field>
                    <FieldLabel htmlFor="name">{t("name")}</FieldLabel>
                    <Input id="name" name="name" autoComplete="name" required />
                  </Field>
                ) : null}
                <Field>
                  <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                  <Input id="email" name="email" type="email" autoComplete="email" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    minLength={8}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    required
                  />
                  <FieldDescription>{t("passwordHint")}</FieldDescription>
                </Field>
                <FieldError>{error}</FieldError>
              </FieldGroup>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : null}
                {!pending && isRegister ? <UserPlusIcon data-icon="inline-start" /> : null}
                {!pending && !isRegister ? <LogInIcon data-icon="inline-start" /> : null}
                {t(`${mode}.submit`)}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          {isRegister ? t("hasAccount") : t("noAccount")}{" "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {isRegister ? t("goLogin") : t("goRegister")}
          </Link>
        </p>
      </div>
    </main>
  );
}
