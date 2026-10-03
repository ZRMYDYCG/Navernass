"use client";

import { WrenchIcon } from "lucide-react";
import { defineMaterial, RawToolDetail, toolPhase } from "./protocol";

/** 兜底物料：未登记的工具按原始 JSON 展示，保证后端新增工具时前端不会丢失信息。 */
export default defineMaterial({
  tool: "*",
  icon: WrenchIcon,
  title: (t, { call }) => t(`tools.fallback.${toolPhase(call)}`, { name: call.tool }),
  detail: RawToolDetail,
});
