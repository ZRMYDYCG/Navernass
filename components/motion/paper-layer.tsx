"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { paperFadeScale } from "./config";

interface PaperLayerProps extends HTMLMotionProps<"div"> {
  /**
   * 是否启用纹理背景
   * @default true
   */
  texture?: boolean;
  /**
   * 阴影强度
   * @default "sm"
   */
  shadow?: "none" | "sm" | "md" | "lg";
  /**
   * 是否作为独立的纸张层级（带有 border 和 background）
   * @default true
   */
  sheet?: boolean;
}

export const PaperLayer = React.forwardRef<HTMLDivElement, PaperLayerProps>(
  ({ className, children, texture = true, shadow = "sm", sheet = true, variants = paperFadeScale, ...props }, ref) => {
    
    const shadowClass = {
      none: "",
      sm: "shadow-paper-sm",
      md: "shadow-paper-md",
      lg: "shadow-paper-lg",
    }[shadow];

    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        className={cn(
          // 基础样式
          "relative overflow-hidden rounded-lg",
          // 纸张特性
          sheet && "bg-background border border-border/40",
          sheet && shadowClass,
          // 纹理叠加
          texture && "bg-paper-texture",
          // 确保内容在纹理之上 (虽然纹理通常是 background-image)
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

PaperLayer.displayName = "PaperLayer";

