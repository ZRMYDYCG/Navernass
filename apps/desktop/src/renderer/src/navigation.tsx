import { createContext, useContext } from "react";

export interface Navigation {
  pathname: string;
  push: (path: string) => void;
  replace: (path: string, options?: { locale: string }) => void;
  refresh: () => void;
}

export const NavigationContext = createContext<Navigation | null>(null);

export function useRouter() {
  const navigation = useContext(NavigationContext);
  if (!navigation) throw new Error("Desktop navigation is unavailable");
  return navigation;
}

export function usePathname() {
  return useRouter().pathname;
}
