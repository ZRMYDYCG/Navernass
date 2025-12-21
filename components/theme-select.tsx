"use client";

import { Moon, Monitor, Sun, SwatchBook } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { useThemeTransition } from "@/hooks/use-theme-transition";

export function ThemeSection() {
  const { theme, setTheme } = useThemeTransition();

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="cursor-pointer border-0 bg-transparent p-1.5 h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
          <SwatchBook className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="popover-content bg-popover rounded-lg p-3 z-50 focus:outline-none w-[240px] border border-border"
          sideOffset={8}
          align="end"
          style={{
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-foreground">Theme</h3>
          </div>
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={(e) => setTheme(option.value, e)}
                  className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-all ${
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{option.label}</span>
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
