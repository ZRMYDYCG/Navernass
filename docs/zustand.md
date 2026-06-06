```text
你是一个资深 React + TypeScript + Zustand 架构重构专家。请基于当前项目代码，重构 Zustand store 的写法，目标是：统一 store 架构、按业务 slice 拆分、action 单独拆分、正确使用 immer/devtools/persist 等 middleware，并保证类型安全、可维护、低重渲染。

一、核心目标

1. 将现有零散、臃肿、不一致的 Zustand store 重构为统一的 slice pattern。
2. 使用一个组合后的 bounded store 作为主入口，例如 useAppStore。
3. 每个业务域独立成 slice，例如 auth、user、cart、editor、settings、permission 等。
4. 每个 slice 必须拆分：
   - state 类型
   - action 类型
   - initialState
   - action factory
   - slice creator
   - selectors
5. 使用 immer middleware 简化嵌套状态更新。
6. middleware 只允许包在组合后的 store 上，禁止在单个 slice 内部单独包 middleware。
7. 保持现有业务行为不变，尽量兼容现有调用；确需改调用方式时，统一更新引用。
8. 重构后必须通过 TypeScript 类型检查、lint、现有测试。

二、目录与文件命名规范

统一使用如下目录结构：

src/store/
  index.ts
  use-app-store.ts
  store.types.ts
  store.middlewares.ts
  store.persist.ts
  slices/
    auth/
      auth.types.ts
      auth.initial-state.ts
      auth.actions.ts
      auth.slice.ts
      auth.selectors.ts
      index.ts
    user/
      user.types.ts
      user.initial-state.ts
      user.actions.ts
      user.slice.ts
      user.selectors.ts
      index.ts

命名约束：

1. 目录名使用 kebab-case 或单个业务名小写，例如 auth、user-profile、editor。
2. 文件名统一使用 domain.xxx.ts，例如 auth.slice.ts、auth.actions.ts。
3. 主 store hook 文件固定为 use-app-store.ts。
4. 主 hook 固定导出 useAppStore。
5. slice creator 命名为 createXxxSlice，例如 createAuthSlice。
6. action factory 命名为 createXxxActions，例如 createAuthActions。
7. initialState 命名为 xxxInitialState，例如 authInitialState。
8. selector 命名为 selectXxx，例如 selectCurrentUser、selectAuthActions。
9. 禁止 default export，全部使用 named export。
10. 禁止继续新增 featureStore.ts、xxxStore.ts 这类孤立 store，除非它是独立 vanilla store 且有明确边界说明。

三、推荐 store 形态

每个业务 slice 使用“状态命名空间 + actions 命名空间”的结构，避免不同 slice 的字段冲突，也避免 persist 误处理 action。

示例形态：

type AuthSlice = {
  auth: AuthState
  authActions: AuthActions
}

不要把 action 混在 auth state 内部，例如不要写成：

auth: {
  user: null,
  token: null,
  login: () => {}
}

推荐写成：

auth: {
  user: null,
  token: null,
  loading: false
},
authActions: {
  login: async () => {},
  logout: () => {},
  setToken: () => {}
}

四、TypeScript 类型约束

在 src/store/store.types.ts 中建立统一类型入口。

需要包含：

1. AppStore：所有 slice 类型的交叉组合。
2. StoreSlice<TSlice>：统一的 StateCreator 类型 helper。
3. StoreSet、StoreGet：从 StoreSlice 中提取 set/get 类型，供 actions.ts 使用。
4. PersistedStore：持久化状态类型，仅包含真正需要持久化的 state 字段，不包含 actions。

示意：

import type { StateCreator } from 'zustand'

export type AppStore =
  AuthSlice &
  UserSlice &
  SettingsSlice

export type StoreSlice<TSlice> = StateCreator<
  AppStore,
  [
    ['zustand/devtools', never],
    ['zustand/persist', unknown],
    ['zustand/immer', never]
  ],
  [],
  TSlice
>

注意：
1. mutator tuple 必须根据实际使用的 middleware 调整。
2. 如果项目只使用 immer + devtools，则不要保留 persist mutator。
3. 如果 TypeScript 报 mutator 顺序错误，优先根据实际 middleware 包裹顺序修正。
4. 不要为了消除类型错误滥用 any。
5. 允许在少数 Zustand middleware 类型边界处使用 unknown，但必须有明确理由。

五、middleware 使用规范

主 store 只能在 src/store/use-app-store.ts 中组合 middleware。

推荐结构：

create<AppStore>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createAuthSlice(...a),
        ...createUserSlice(...a),
        ...createSettingsSlice(...a),
      })),
      persistOptions
    ),
    devtoolsOptions
  )
)

约束：

1. immer 用于允许 set((state) => { state.xxx = value }) 这种写法。
2. devtools 尽量放在最外层。
3. persist 只持久化必要字段，必须使用 partialize。
4. 不要持久化 loading、error、modalOpen、临时表单、请求状态、分页临时状态等 ephemeral state。
5. persist 必须配置 name。
6. 如果已有持久化数据结构，必须配置 version 和 migrate，避免线上用户 localStorage 数据不兼容。
7. devtools 必须配置 name，例如 app-store。
8. set 调用尽量补充 action name，例如：
   set((state) => {
     state.auth.user = user
   }, false, 'auth/setUser')
9. 禁止在单个 slice 文件中调用 devtools、persist、immer。
10. 禁止多个 middleware 分散在多个文件里隐式组合。

六、slice 文件职责

以 auth 为例：

1. auth.types.ts

只定义类型：

export type AuthState = {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

export type AuthActions = {
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export type AuthSlice = {
  auth: AuthState
  authActions: AuthActions
}

2. auth.initial-state.ts

只放初始 state：

export const authInitialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
}

3. auth.actions.ts

只放 action factory：

export const createAuthActions = (
  set: StoreSet,
  get: StoreGet
): AuthActions => ({
  setUser: (user) => {
    set((state) => {
      state.auth.user = user
    }, false, 'auth/setUser')
  },

  setToken: (token) => {
    set((state) => {
      state.auth.token = token
    }, false, 'auth/setToken')
  },

  logout: () => {
    set((state) => {
      state.auth.user = null
      state.auth.token = null
    }, false, 'auth/logout')
  },
})

约束：
1. action 内允许通过 get() 访问其他 slice。
2. 跨 slice 行为优先放在业务归属最明确的 slice，或单独建立 shared/app slice。
3. action 内不要直接发散复杂副作用；复杂请求逻辑优先放 service 层，action 只负责提交状态。
4. 不要在初始化 state 时同步调用 get()。

4. auth.slice.ts

只负责组合 state + actions：

export const createAuthSlice: StoreSlice<AuthSlice> = (set, get, store) => ({
  auth: authInitialState,
  authActions: createAuthActions(set, get, store),
})

5. auth.selectors.ts

只放 selectors：

export const selectAuth = (state: AppStore) => state.auth
export const selectCurrentUser = (state: AppStore) => state.auth.user
export const selectAuthLoading = (state: AppStore) => state.auth.loading
export const selectAuthActions = (state: AppStore) => state.authActions

组件中必须优先使用 selector，避免：

const state = useAppStore()

推荐：

const user = useAppStore(selectCurrentUser)
const { logout } = useAppStore(selectAuthActions)

七、组件调用规范

1. React 组件中禁止无选择器读取整个 store。
2. 组件只订阅自己需要的最小状态。
3. 多字段选择时，可使用 useShallow 或拆成多个 selector，避免无意义重渲染。
4. action 可通过 actions selector 获取。
5. 非 React 模块中可以使用 useAppStore.getState()，但不要在 React render 中滥用。
6. 禁止在组件中直接修改 store 对象。
7. 禁止把服务端缓存型数据强行塞进 Zustand；如果项目已有 React Query / SWR，应优先保持服务端状态由它们管理。

八、重构步骤

请按以下步骤执行：

1. 扫描项目中所有 Zustand 相关代码：
   - create
   - createStore
   - zustand/middleware
   - useXxxStore
   - getState
   - setState

2. 列出现有 store：
   - store 名称
   - 管理的 state
   - actions
   - 是否持久化
   - 被哪些组件/模块使用
   - 是否存在跨 store 依赖

3. 设计新的 slice 划分：
   - 按业务域拆分，不按页面拆分。
   - 一个 slice 不要过大；如果字段和 action 明显属于不同业务域，继续拆。
   - 避免过度拆分，不要为了拆分而拆分。

4. 建立 src/store 新目录结构。

5. 迁移每个旧 store：
   - 先迁移 types
   - 再迁移 initialState
   - 再迁移 actions
   - 再迁移 slice
   - 最后迁移 selectors

6. 建立 useAppStore：
   - 组合所有 slice
   - 添加 immer
   - 根据原项目情况添加 persist/devtools/subscribeWithSelector
   - 配置 persist partialize、version、migrate
   - 配置 devtools name

7. 更新所有调用方：
   - 替换旧 useXxxStore import
   - 使用新 selectors
   - 更新 action 调用路径，例如 state.authActions.logout
   - 保持业务行为一致

8. 清理旧代码：
   - 删除废弃 store 文件
   - 删除重复类型
   - 删除重复 action
   - 删除过时 export

9. 运行并修复：
   - TypeScript 类型检查
   - lint
   - test
   - build

九、禁止事项

1. 禁止把 middleware 写进单个 slice。
2. 禁止在初始化 state 时同步调用 get()。
3. 禁止使用 any 逃避 Zustand middleware 类型问题。
4. 禁止 persist 整个 AppStore。
5. 禁止持久化 actions。
6. 禁止持久化 loading/error/modal/form draft 等临时 UI 状态。
7. 禁止组件 useAppStore() 读取整个 store。
8. 禁止在 action 外部直接 mutate state。
9. 禁止在 set 中使用 replace=true，除非明确要替换整个 store，并确认不会删除 actions。
10. 禁止保留多个风格不一致的 Zustand store 写法。

十、输出要求

完成后请输出：

1. 新的 store 目录结构。
2. 每个 slice 的职责说明。
3. middleware 使用说明。
4. persist 字段说明。
5. 迁移了哪些旧 store。
6. 修改了哪些调用方。
7. 是否存在兼容性风险。
8. TypeScript/lint/test/build 的执行结果。
9. 如果有无法安全自动迁移的地方，标注 TODO，并说明原因。

十一、质量标准

1. 类型必须准确。
2. action 命名必须清晰，格式为 domain/actionName。
3. selectors 必须完整覆盖常用读取路径。
4. 业务行为必须保持一致。
5. store 架构必须可扩展。
6. 新增业务 slice 时，只需要新增 slices/xxx 目录，并在 use-app-store.ts 中组合。
7. 最终代码应该让后续开发者可以按固定模板继续开发，而不是继续自由发挥。
```

[1]: https://raw.githubusercontent.com/pmndrs/zustand/main/docs/learn/guides/slices-pattern.md 'raw.githubusercontent.com'
