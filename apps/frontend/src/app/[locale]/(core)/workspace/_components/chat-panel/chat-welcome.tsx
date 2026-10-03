"use client";

import Image from "next/image";
import { CodeIcon, ImagesIcon, LayersIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentType, ReactNode } from "react";

interface WelcomeProps {
  /** 渲染在标题与快捷操作之间的输入区。 */
  children?: ReactNode;
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

type ActionId = "continue" | "plot" | "polish";

const ACTIONS: { id: ActionId; icon: ComponentType<{ className?: string }> }[] = [
  { id: "continue", icon: ImagesIcon },
  { id: "plot", icon: LayersIcon },
  { id: "polish", icon: CodeIcon },
];

export function Welcome({ children, onSelectPrompt, disabled }: WelcomeProps) {
  const t = useTranslations("chat.welcome");

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Image src="/logo.png" alt="" width={72} height={72} className="rounded-2xl" priority />
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">{t("heading")}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="grid w-full gap-3 md:grid-cols-3">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(t(`actions.${action.id}.prompt`))}
            className="flex min-h-32 flex-col items-start gap-3 rounded-lg border border-border bg-background p-5 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <action.icon className="size-4" />
            </span>
            <span className="space-y-1">
              <span className="block text-sm font-medium text-foreground">
                {t(`actions.${action.id}.title`)}
              </span>
              <span className="block text-sm leading-relaxed text-muted-foreground">
                {t(`actions.${action.id}.description`)}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="w-full">{children}</div>
    </div>
  );
}
