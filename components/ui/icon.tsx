import React from "react";

export interface IconProps {
  /** 图标名称（对应 app/assets/svg 目录下的 SVG 文件名） */
  name: string;
  /** 图标尺寸，可以是数字（px）或字符串（如 "1.5em"） */
  size?: number | string;
  /** 自定义类名 */
  className?: string;
  /** 图标颜色，默认 currentColor */
  color?: string;
  /** 点击事件 */
  onClick?: () => void;
}

/**
 * SVG 图标组件
 * 使用 vite-plugin-svg-icons-ng 加载 SVG sprite
 *
 * @example
 * <Icon name="home" size={24} />
 * <Icon name="user" size="1.5em" className="text-blue-500" />
 */
export function Icon({
  name,
  size = 24,
  className = "",
  color = "currentColor",
  onClick,
}: IconProps) {
  const symbolId = `#icon-${name}`;

  const sizeStyle = typeof size === "number" ? `${size}px` : size;

  return (
    <svg
      className={className}
      style={{ width: sizeStyle, height: sizeStyle }}
      fill={color}
      onClick={onClick}
      aria-hidden="true"
    >
      <use href={symbolId} />
    </svg>
  );
}
