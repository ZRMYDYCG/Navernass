"use client";

import { LogOutIcon, UserRoundIcon } from "lucide-react";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSession, useSignOut } from "@/lib/query/auth.query";
import { useNovels } from "@/lib/query/novel.query";

import { AuthDialog } from "./auth-dialog";

interface AuthBarProps {
  onNovelSelect: (novelId: string) => void;
}

export function AuthBar({ onNovelSelect }: AuthBarProps) {
  const t = useTranslations("chat.auth");
  const { data: session, isPending } = useSession();
  const signOut = useSignOut();
  const { data: novels } = useNovels({ enabled: Boolean(session?.user) });
  const firstNovelId = novels?.[0]?.id;

  useEffect(() => {
    if (firstNovelId) onNovelSelect(firstNovelId);
  }, [firstNovelId, onNovelSelect]);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-3">
        <span className="font-medium">Narraverse</span>
        <Badge variant="secondary">cc-opus-4-7</Badge>
      </div>

      {isPending ? (
        <Spinner />
      ) : session?.user ? (
        <div className="flex items-center gap-2">
          <UserRoundIcon className="size-4 text-muted-foreground" />
          <span className="hidden text-sm sm:inline">{session.user.email}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={signOut.isPending}
            onClick={() => signOut.mutate()}
          >
            <LogOutIcon />
            {t("signOut")}
          </Button>
        </div>
      ) : (
        <AuthDialog />
      )}
    </header>
  );
}
