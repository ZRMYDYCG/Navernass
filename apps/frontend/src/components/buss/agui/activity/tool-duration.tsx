"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { AgentMessageMetadata } from "@/lib/agent/chat-types";

type Timing = NonNullable<AgentMessageMetadata["toolTimings"]>[string];

export function ToolDuration({ timing, running }: { timing?: Timing; running: boolean }) {
  const t = useTranslations("agui.duration");
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!running) return;
    const started = timing?.startedAt ?? Date.now();
    const tick = () => setElapsed(Math.max(0, Date.now() - started));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [running, timing?.startedAt]);
  const duration = timing?.durationMs;
  if (duration === undefined && !running) return null;
  const seconds = ((duration ?? elapsed) / 1000).toFixed(1);
  return (
    <span
      className="text-xs tabular-nums"
      title={duration === undefined ? t("live") : t("measured")}
    >
      {duration === undefined ? "~" : ""}
      {t("seconds", { seconds })}
    </span>
  );
}
