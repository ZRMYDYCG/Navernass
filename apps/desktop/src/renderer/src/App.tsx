import { useEffect, useRef, useState } from "react";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogInIcon, LogOutIcon } from "lucide-react";

import { Agents } from "@/app/[locale]/(core)/agents/_components/agents";
import { Workspace } from "@/app/[locale]/(core)/workspace/_components/workspace";
import { AuthDialogProvider, useAuthDialog } from "@/components/buss/auth-dialog";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSession, signOut } from "@/lib/http/modules/auth.api";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { useNovels, useCreateStarterWorkspace } from "@/servers/library.server";
import { useWorkspaceStore } from "@/stores";
import zh from "../frontend/messages/zh-CN.json";
import en from "../frontend/messages/en-US.json";
import { NavigationContext } from "./navigation";

export function App() {
  const [locale, setLocale] = useState(() => localStorage.getItem("narraverse:locale") ?? "zh-CN");
  const [pathname, setPathname] = useState("/agents");

  useEffect(() => {
    document.documentElement.lang = locale;
    const onPopState = () => setPathname(window.location.hash.slice(1) || "/agents");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={locale === "en-US" ? en : zh}>
      <ThemeProvider>
        <QueryProvider>
          <TooltipProvider>
            <NavigationContext.Provider
              value={{
                pathname,
                push: (path) => {
                  window.history.pushState(null, "", `#${path}`);
                  setPathname(path);
                },
                replace: (path, options) => {
                  if (options) {
                    localStorage.setItem("narraverse:locale", options.locale);
                    setLocale(options.locale);
                  }
                  window.history.replaceState(null, "", `#${path}`);
                  setPathname(path);
                },
                refresh: () => {},
              }}
            >
              <Desktop pathname={pathname} onSignedOut={() => setPathname("/agents")} />
            </NavigationContext.Provider>
          </TooltipProvider>
        </QueryProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}

function Desktop({ pathname, onSignedOut }: { pathname: string; onSignedOut: () => void }) {
  const queryClient = useQueryClient();
  const session = useQuery({ queryKey: ["desktop", "session"], queryFn: getSession });
  const user = session.data?.user;
  const t = useTranslations("workspaceStarter");
  const novels = useNovels(Boolean(user));
  const starter = useCreateStarterWorkspace();
  const startedFor = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!user || !novels.isSuccess || novels.data.length || startedFor.current === user.id) return;
    startedFor.current = user.id;
    starter.mutate({ novelTitle: t("novelTitle"), chapterTitle: t("chapterTitle") });
  }, [user, novels.isSuccess, novels.data, starter, t]);

  return (
    <AuthDialogProvider
      onAuthenticated={() => {
        void queryClient.invalidateQueries();
      }}
    >
      {pathname === "/workspace" && user && novels.data?.length ? (
        <Workspace key={user.id} />
      ) : (
        <Agents
          key={user?.id ?? "guest"}
          guest={!user}
          sidebarFooter={
            <Account
              name={user?.name || user?.email}
              onSignedOut={() => {
                useWorkspaceStore.setState({
                  novelId: undefined,
                  chapterId: undefined,
                  sessionIds: {},
                });
                startedFor.current = undefined;
                queryClient.setQueryData(["desktop", "session"], null);
                queryClient.removeQueries({
                  predicate: (query) => query.queryKey[0] !== "desktop",
                });
                onSignedOut();
                void session.refetch();
              }}
            />
          }
        />
      )}
    </AuthDialogProvider>
  );
}

function Account({ name, onSignedOut }: { name?: string; onSignedOut: () => void }) {
  const t = useTranslations("auth");
  const { openAuthDialog } = useAuthDialog();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-col gap-2 border-t border-border p-3">
      {name ? <span className="truncate text-sm text-muted-foreground">{name}</span> : null}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
      <Button
        variant="ghost"
        disabled={pending}
        onClick={async () => {
          if (!name) return openAuthDialog();
          setPending(true);
          setError(undefined);
          try {
            await signOut();
            onSignedOut();
          } catch (caught) {
            setError(caught instanceof Error ? caught.message : t("error"));
          } finally {
            setPending(false);
          }
        }}
      >
        {name ? <LogOutIcon /> : <LogInIcon />}
        {name ? t("signOut") : t("login.submit")}
      </Button>
    </div>
  );
}
