"use client";

import { scan } from "react-scan";
import { useEffect } from "react";

/**
 * 仅在开发环境启动 React 渲染诊断，不向组件树注入额外节点。
 */
export function ScanProvider() {
  useEffect(() => {
    // 只在客户端挂载后初始化，避免诊断工具参与服务端渲染。
    scan({
      enabled: process.env.NODE_ENV === "development",
    });
  }, []);

  return null;
}
