"use client";

import { useTranslations } from "next-intl";

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

import type { SidebarView } from "../types";

/** 已实现视图之外的占位视图。 */
type UnimplementedView = Exclude<SidebarView, "novel" | "search" | "characters">;

interface SidebarPlaceholderViewProps {
  view: UnimplementedView;
}

export function SidebarPlaceholderView({ view }: SidebarPlaceholderViewProps) {
  const t = useTranslations("sidebar.views");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{t(view)}</EmptyTitle>
        <EmptyDescription>{t("comingSoon")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
