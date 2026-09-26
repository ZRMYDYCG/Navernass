import type { ReactNode } from "react";
import { cn } from "cn";

export function ToolField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function ToolExcerpt({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "error";
}) {
  return (
    <div
      className={cn(
        "max-h-64 overflow-auto text-xs leading-relaxed wrap-break-word whitespace-pre-wrap",
        tone === "error" ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {children}
    </div>
  );
}

export function ToolMeta({ items }: { items: Array<string | false | undefined> }) {
  const visible = items.filter((item): item is string => Boolean(item));
  if (!visible.length) return null;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
      {visible.map((item, index) => (
        <span key={`${index}-${item}`}>{item}</span>
      ))}
    </div>
  );
}

export function ToolMarkdown({ children }: { children: ReactNode }) {
  return (
    <div className="max-h-80 overflow-auto text-sm leading-relaxed text-foreground">{children}</div>
  );
}
