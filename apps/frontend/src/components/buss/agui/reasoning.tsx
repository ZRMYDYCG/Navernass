"use client";

import { LightbulbIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { StreamText } from "./stream-text";
import { ToolGroup, ToolRow } from "./tool-shell";

interface ReasoningProps {
  text: string;
  active: boolean;
}

/** 推理生成时展开并跟随到底部；消息结束后以折叠状态进入历史。 */
export function Reasoning({ text, active }: ReasoningProps) {
  const t = useTranslations("agui.reasoning");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (active && element) element.scrollTop = element.scrollHeight;
  }, [active, text]);

  return (
    <ToolGroup>
      <ToolRow
        icon={LightbulbIcon}
        title={active ? t("running") : t("done")}
        status={active ? "running" : "done"}
        autoOpen={active}
      >
        <div
          ref={scrollRef}
          className="max-h-64 overflow-y-auto border-s-2 border-input ps-3 text-xs leading-relaxed text-muted-foreground"
        >
          <StreamText text={text} streaming={active} />
        </div>
      </ToolRow>
    </ToolGroup>
  );
}
