"use client";

import { LightbulbIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { StreamText } from "../message/stream-text";
import { ToolGroup, ToolRow } from "./tool-row";

interface ReasoningProps {
  text: string;
  active: boolean;
}

/** Keep the user's expansion and reading position when reasoning completes. */
export function Reasoning({ text, active }: ReasoningProps) {
  const t = useTranslations("agui.reasoning");
  const scrollRef = useRef<HTMLDivElement>(null);
  const followRef = useRef(true);

  useEffect(() => {
    const element = scrollRef.current;
    if (active && element && followRef.current) element.scrollTop = element.scrollHeight;
  }, [active, text]);

  return (
    <ToolGroup>
      <ToolRow
        icon={LightbulbIcon}
        title={active ? t("running") : t("done")}
        status={active ? "running" : "done"}
        defaultOpen={active}
      >
        <div
          ref={scrollRef}
          onScroll={(event) => {
            const element = event.currentTarget;
            followRef.current =
              element.scrollHeight - element.scrollTop - element.clientHeight < 24;
          }}
          className="max-h-64 overflow-y-auto border-s border-border/80 ps-3 text-xs leading-relaxed text-muted-foreground"
        >
          <StreamText text={text} streaming={active} />
        </div>
      </ToolRow>
    </ToolGroup>
  );
}
