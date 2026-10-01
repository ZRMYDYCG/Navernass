"use client";

import { BookOpenIcon, GitBranchIcon, PencilIcon, SparklesIcon, UserRoundIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentType, ReactNode } from "react";

interface WelcomeProps {
  /** 渲染在标题与快捷操作之间的输入区。 */
  children?: ReactNode;
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

type ActionId = "continue" | "plot" | "character" | "polish" | "lore";

const ACTIONS: { id: ActionId; icon: ComponentType<{ className?: string }> }[] = [
  { id: "continue", icon: PencilIcon },
  { id: "plot", icon: GitBranchIcon },
  { id: "character", icon: UserRoundIcon },
  { id: "polish", icon: SparklesIcon },
  { id: "lore", icon: BookOpenIcon },
];

export function Welcome({ children, onSelectPrompt, disabled }: WelcomeProps) {
  const t = useTranslations("chat.welcome");

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex flex-col gap-2.5 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-balance">{t("heading")}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          {t("description")}
        </p>
      </div>

      <div className="w-full">{children}</div>

      <div className="flex flex-wrap justify-center gap-2">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            title={t(`actions.${action.id}.description`)}
            disabled={disabled}
            onClick={() => onSelectPrompt(t(`actions.${action.id}.prompt`))}
            className="inline-flex items-center gap-1.5 rounded-full border border-input px-3 py-1.5 text-xs text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
          >
            <action.icon className="size-3.5" />
            {t(`actions.${action.id}.title`)}
          </button>
        ))}
      </div>
    </div>
  );
}
