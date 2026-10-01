import type { ReactNode } from "react";

export function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-1/2 bottom-0.5 -z-10 -rotate-1 rounded-xs bg-primary/20"
      />
      <span className="relative">{children}</span>
    </span>
  );
}
