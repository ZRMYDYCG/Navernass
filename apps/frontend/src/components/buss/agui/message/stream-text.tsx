"use client";

import { memo, type ComponentProps } from "react";
import { Streamdown, type Components } from "streamdown";

import { cn } from "cn";

interface StreamTextProps {
  text: string;
  streaming?: boolean;
}

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type HeadingProps = ComponentProps<HeadingTag> & { node?: unknown };

/** 聊天面板空间有限，标题字号在 streamdown 默认值基础上整体下调。 */
function createHeading(tag: HeadingTag, size: string): Components[HeadingTag] {
  const Heading = ({ children, className, node: _node, ...props }: HeadingProps) => {
    const Tag = tag;
    return (
      <Tag
        {...props}
        className={cn("mt-6 mb-2 font-semibold", size, className)}
        data-streamdown={`heading-${tag[1]}`}
      >
        {children}
      </Tag>
    );
  };
  Heading.displayName = `MarkdownH${tag[1].toUpperCase()}`;
  return Heading;
}

const components: Components = {
  h1: createHeading("h1", "text-xl"),
  h2: createHeading("h2", "text-lg"),
  h3: createHeading("h3", "text-base"),
  h4: createHeading("h4", "text-base"),
  h5: createHeading("h5", "text-sm"),
  h6: createHeading("h6", "text-sm"),
};

/** 只有仍在生成的最后一段文本使用 streaming 模式，其余段落按静态 Markdown 渲染。 */
export const StreamText = memo(function StreamText({ text, streaming = false }: StreamTextProps) {
  return (
    <Streamdown mode={streaming ? "streaming" : "static"} components={components}>
      {text}
    </Streamdown>
  );
});
