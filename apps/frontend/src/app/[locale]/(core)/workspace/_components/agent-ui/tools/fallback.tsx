"use client";

import { WrenchIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { ToolExcerpt, ToolField } from "../activity/tool-detail";
import { defineTool, toolPhase, type ToolProps } from "./define";

function stringify(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function FallbackDetail({ call }: ToolProps<unknown, unknown>) {
  const t = useTranslations("agui.detail");
  return (
    <>
      {call.input === undefined ? null : (
        <ToolField label={t("input")}>
          <ToolExcerpt>{stringify(call.input)}</ToolExcerpt>
        </ToolField>
      )}
      {call.output === undefined ? null : (
        <ToolField label={t("output")}>
          <ToolExcerpt>{stringify(call.output)}</ToolExcerpt>
        </ToolField>
      )}
    </>
  );
}

/** 未登记的工具按原始 JSON 展示，保证后端新增工具时前端不会丢失信息。 */
export const fallback = defineTool<unknown, unknown>({
  icon: WrenchIcon,
  title: (t, { call }) => t(`tools.fallback.${toolPhase(call)}`, { name: call.name }),
  Detail: FallbackDetail,
});
