"use client";

import { LogInIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/http/error";
import { useSignIn, useSignUp } from "@/lib/query/auth.query";

type AuthMode = "sign-in" | "sign-up";

export function AuthDialog() {
  const t = useTranslations("chat.auth");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const signIn = useSignIn();
  const signUp = useSignUp();
  const mutation = mode === "sign-in" ? signIn : signUp;

  const resetErrors = () => {
    signIn.reset();
    signUp.reset();
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    resetErrors();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const close = { onSuccess: () => setOpen(false) };

    if (mode === "sign-in") {
      signIn.mutate({ email, password }, close);
    } else {
      signUp.mutate({ name: String(form.get("name")), email, password }, close);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetErrors();
      }}
    >
      <DialogTrigger render={<Button size="sm" />}>
        <LogInIcon />
        {t("signIn")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "sign-in" ? t("signInTitle") : t("signUpTitle")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "sign-in" ? "default" : "outline"}
            onClick={() => switchMode("sign-in")}
          >
            {t("signIn")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "sign-up" ? "default" : "outline"}
            onClick={() => switchMode("sign-up")}
          >
            {t("signUp")}
          </Button>
        </div>

        <form onSubmit={submit}>
          <FieldGroup>
            {mode === "sign-up" ? (
              <Field>
                <FieldLabel htmlFor="auth-name">{t("name")}</FieldLabel>
                <Input id="auth-name" name="name" autoComplete="name" required />
              </Field>
            ) : null}
            <Field>
              <FieldLabel htmlFor="auth-email">{t("email")}</FieldLabel>
              <Input
                id="auth-email"
                name="email"
                type="email"
                defaultValue="writer@example.com"
                autoComplete="email"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="auth-password">{t("password")}</FieldLabel>
              <Input
                id="auth-password"
                name="password"
                type="password"
                minLength={8}
                maxLength={128}
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                required
              />
            </Field>
            {mutation.error ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {mutation.error instanceof ApiError ? mutation.error.message : t("failed")}
                </AlertDescription>
              </Alert>
            ) : null}
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Spinner /> : null}
              {mode === "sign-in" ? t("signIn") : t("signUp")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
