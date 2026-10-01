"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { useWorkspaceEntry } from "./auth-dialog";

type AuthCtaButtonProps = Omit<ComponentProps<typeof Button>, "onClick">;

/**
 * 写作入口按钮：已登录直达工作台，未登录在当前页弹出登录/注册弹窗。
 */
export function AuthCtaButton(props: AuthCtaButtonProps) {
  const enterWorkspace = useWorkspaceEntry();

  return <Button {...props} onClick={() => void enterWorkspace()} />;
}
