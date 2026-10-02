"use client";

import { Loader2Icon, LogInIcon, UserPlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { createContext, useContext, useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";
import { signInEmail, signUpEmail, getSession } from "@/lib/http/modules/auth.api";

type AuthMode = "login" | "register";

interface AuthDialogContextValue {
  openAuthDialog: (mode?: AuthMode) => void;
}

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

function AuthDialogForm({
  mode,
  onModeChange,
  onSuccess,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSuccess: () => void;
}) {
  const t = useTranslations("auth");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";

  function switchMode(next: AuthMode) {
    setError(undefined);
    onModeChange(next);
  }

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
      onSuccess();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("error"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <FieldGroup>
        {isRegister ? (
          <Field>
            <FieldLabel htmlFor="auth-name">{t("name")}</FieldLabel>
            <Input id="auth-name" name="name" autoComplete="name" required />
          </Field>
        ) : null}
        <Field>
          <FieldLabel htmlFor="auth-email">{t("email")}</FieldLabel>
          <Input id="auth-email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="auth-password">{t("password")}</FieldLabel>
          <Input
            id="auth-password"
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
      <p className="text-center text-sm text-muted-foreground">
        {isRegister ? t("hasAccount") : t("noAccount")}{" "}
        <Button
          type="button"
          variant="link"
          onClick={() => switchMode(isRegister ? "login" : "register")}
        >
          {isRegister ? t("goLogin") : t("goRegister")}
        </Button>
      </p>
    </form>
  );
}

/**
 * 全局登录/注册弹窗。未登录用户点击入口按钮时在当前页弹出，不再跳转独立页面。
 */
export function AuthDialogProvider({
  children,
  onAuthenticated,
}: {
  children: ReactNode;
  onAuthenticated?: () => void;
}) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const contextValue: AuthDialogContextValue = {
    openAuthDialog: (next = "login") => {
      setMode(next);
      setOpen(true);
    },
  };

  function handleSuccess() {
    setOpen(false);
    if (onAuthenticated) onAuthenticated();
    else {
      router.push("/workspace");
      router.refresh();
    }
  }

  return (
    <AuthDialogContext.Provider value={contextValue}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(`${mode}.title`)}</DialogTitle>
            <DialogDescription>{t(`${mode}.description`)}</DialogDescription>
          </DialogHeader>
          <AuthDialogForm mode={mode} onModeChange={setMode} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog() {
  const context = useContext(AuthDialogContext);
  if (!context) throw new Error("useAuthDialog 必须在 AuthDialogProvider 内使用");
  return context;
}

/**
 * 已登录则进入工作台，未登录则弹出登录弹窗。
 */
export function useWorkspaceEntry() {
  const { openAuthDialog } = useAuthDialog();
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  async function enterWorkspace() {
    if (checking) return;
    setChecking(true);
    try {
      const session = await getSession();
      if (session) {
        router.push("/workspace");
        router.refresh();
      } else {
        openAuthDialog("login");
      }
    } finally {
      setChecking(false);
    }
  }

  return enterWorkspace;
}
