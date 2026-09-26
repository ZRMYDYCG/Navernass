"use client";

import { memo } from "react";
import { Streamdown } from "streamdown";

interface StreamTextProps {
  text: string;
  streaming?: boolean;
}

/** 只有仍在生成的最后一段文本使用 streaming 模式，其余段落按静态 Markdown 渲染。 */
export const StreamText = memo(function StreamText({ text, streaming = false }: StreamTextProps) {
  return <Streamdown mode={streaming ? "streaming" : "static"}>{text}</Streamdown>;
});
