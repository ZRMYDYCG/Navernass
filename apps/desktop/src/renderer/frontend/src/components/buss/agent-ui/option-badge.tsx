import { cn } from "cn";

export function optionLetter(index: number) {
  return String.fromCharCode(65 + index);
}

/** 字母选项徽标；父元素需带 `group/option`，选中时设置 `data-checked`。 */
export function OptionBadge({ children }: { children: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded border border-input text-xs font-medium text-muted-foreground",
        "group-data-checked/option:border-primary group-data-checked/option:bg-primary group-data-checked/option:text-primary-foreground",
      )}
    >
      {children}
    </span>
  );
}
