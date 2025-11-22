"use client";

import { useTheme } from "next-themes";
import { useCallback } from "react";

export function useThemeTransition() {
  const { setTheme: originalSetTheme, theme, resolvedTheme } = useTheme();

  const setTheme = useCallback(
    (newTheme: string, event?: React.MouseEvent) => {
      if (!event || !document.startViewTransition) {
        originalSetTheme(newTheme);
        return;
      }

      const x = event.clientX;
      const y = event.clientY;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      document.documentElement.style.setProperty('--x', `${x}px`);
      document.documentElement.style.setProperty('--y', `${y}px`);
      document.documentElement.style.setProperty('--r', `${endRadius}px`);

      const transition = document.startViewTransition(() => {
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (newTheme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      });

      transition.finished.finally(() => {
        originalSetTheme(newTheme);
      });
    },
    [originalSetTheme]
  );

  return { theme, resolvedTheme, setTheme };
}
