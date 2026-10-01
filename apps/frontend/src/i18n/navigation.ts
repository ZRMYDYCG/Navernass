import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * 基于 routing 创建的国际化导航 API。
 * 与 next/navigation 的同名 API 相比，Link / redirect / useRouter 等
 * 会自动拼接当前语言前缀，调用方无需手动维护 locale。
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
