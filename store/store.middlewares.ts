/**
 * 中间件常量与说明。
 *
 * 实际的 middleware 组合在 use-app-store.ts 中通过 create 直接完成。
 *
 * 中间件规则（见 docs/zustand.md）：
 * - 中间件只允许在 use-app-store.ts 中组合，禁止在单个 slice 内单独包
 * - 顺序：devtools 在最外层，immer 在内层
 * - devtools 必须配置 name
 * - 当前项目不需要 persist：业务数据是会话级服务端缓存，不写入 localStorage
 */

export const APP_STORE_DEVTOOLS_NAME = 'app-store'
