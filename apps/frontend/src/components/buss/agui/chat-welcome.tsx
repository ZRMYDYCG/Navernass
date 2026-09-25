"use client";

import {
  BookOpenIcon,
  ChevronRightIcon,
  GitBranchIcon,
  PencilIcon,
  SparklesIcon,
  UserRoundIcon,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";

import { Separator } from "@/components/ui/separator";
import { cn } from "cn";

interface ChatWelcomeProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

type ActionId = "continue" | "plot" | "character" | "polish" | "lore";
type SuggestionId = "continue" | "plot" | "scene" | "ooc";

const ACTIONS: { id: ActionId; icon: ComponentType<{ className?: string }>; featured?: boolean }[] =
  [
    { id: "continue", icon: PencilIcon, featured: true },
    { id: "plot", icon: GitBranchIcon },
    { id: "character", icon: UserRoundIcon },
    { id: "polish", icon: SparklesIcon },
    { id: "lore", icon: BookOpenIcon },
  ];

const SUGGESTIONS: SuggestionId[] = ["continue", "plot", "scene", "ooc"];

export function ChatWelcome({ onSelectPrompt, disabled }: ChatWelcomeProps) {
  const t = useTranslations("chat.welcome");
  const featured = ACTIONS.find((action) => action.featured);
  const grid = ACTIONS.filter((action) => !action.featured);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-1 py-2">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative w-full max-w-xs">
          <Image
            src="/chat-welcome-hero.png"
            alt=""
            width={1942}
            height={809}
            priority
            className="h-auto w-full mix-blend-screen"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-balance">{t("heading")}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {featured ? (
          <ActionCard
            title={t(`actions.${featured.id}.title`)}
            description={t(`actions.${featured.id}.description`)}
            icon={featured.icon}
            iconClassName="bg-accent text-accent-foreground"
            featured
            disabled={disabled}
            onClick={() => onSelectPrompt(t(`actions.${featured.id}.prompt`))}
          />
        ) : null}

        <div className="grid grid-cols-2 gap-2.5">
          {grid.map((action) => (
            <ActionCard
              key={action.id}
              title={t(`actions.${action.id}.title`)}
              description={t(`actions.${action.id}.description`)}
              icon={action.icon}
              iconClassName={
                action.id === "plot"
                  ? "bg-chart-1/15 text-chart-1"
                  : action.id === "character"
                    ? "bg-chart-2/15 text-chart-2"
                    : action.id === "polish"
                      ? "bg-chart-4/20 text-chart-4"
                      : "bg-chart-3/15 text-chart-3"
              }
              disabled={disabled}
              onClick={() => onSelectPrompt(t(`actions.${action.id}.prompt`))}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="shrink-0 text-xs text-muted-foreground">{t("suggestionsLabel")}</span>
          <Separator className="flex-1" />
        </div>
        <div className="flex flex-col gap-2">
          {SUGGESTIONS.map((id) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              className="rounded-full border border-border bg-background px-3.5 py-2 text-left text-sm text-muted-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
              onClick={() => onSelectPrompt(t(`suggestions.${id}`))}
            >
              {t(`suggestions.${id}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon: Icon,
  iconClassName,
  featured,
  disabled,
  onClick,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  featured?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full rounded-xl text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        featured
          ? "flex items-center gap-3 bg-accent px-3.5 py-3.5 hover:bg-accent/80"
          : "relative flex flex-col gap-2.5 bg-card p-3 pr-8 ring-1 ring-foreground/10 hover:bg-muted/60",
      )}
    >
      <span
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
          iconClassName,
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className={cn(featured && "min-w-0 flex-1")}>
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
          {description}
        </span>
      </span>
      <ChevronRightIcon
        className={cn(
          "size-4 shrink-0 text-muted-foreground",
          !featured && "absolute right-3 bottom-3 size-3.5",
        )}
      />
    </button>
  );
}
