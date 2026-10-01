"use client";

import { BrainIcon, ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "cn";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { StreamText } from "../message/stream-text";

interface ReasoningProps {
  text: string;
  active: boolean;
}

const autoCloseDelayMs = 1_000;

/** 生成时自动展开，结束后显示思考时长并自动收起；历史消息默认收起。 */
export function Reasoning({ text, active }: ReasoningProps) {
  const t = useTranslations("agui.reasoning");
  // 只有在生成中挂载的推理才计时；从历史加载的没有时长。
  const [startedAt] = useState(() => (active ? Date.now() : undefined));
  const [seconds, setSeconds] = useState<number>();
  const [autoClosed, setAutoClosed] = useState(false);
  const [userOpen, setUserOpen] = useState<boolean>();
  const open = userOpen ?? (active || (startedAt !== undefined && !autoClosed));

  useEffect(() => {
    if (active || startedAt === undefined) return;
    const measure = window.setTimeout(() => {
      setSeconds(Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
    }, 0);
    const close = window.setTimeout(() => {
      setAutoClosed(true);
      setUserOpen(undefined);
    }, autoCloseDelayMs);
    return () => {
      window.clearTimeout(measure);
      window.clearTimeout(close);
    };
  }, [active, startedAt]);

  const label = active
    ? t("running")
    : seconds !== undefined
      ? t("duration", { seconds })
      : t("done");

  return (
    <Collapsible open={open} onOpenChange={setUserOpen}>
      <CollapsibleTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        }
      >
        <BrainIcon className="size-4 shrink-0" />
        <span className={cn(active && "text-shimmer")}>{label}</span>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 transition-transform motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
          <StreamText text={text} streaming={active} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
