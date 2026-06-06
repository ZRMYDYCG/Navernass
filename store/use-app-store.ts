import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createAiEditsSlice } from './slices/ai-edits'
import { createChaptersSlice } from './slices/chapters'
import { createCharacterGraphSlice } from './slices/character-graph'
import { createCharacterMaterialSlice } from './slices/character-material'
import { createChatSlice } from './slices/chat'
import { createNovelChatSlice } from './slices/novel-chat'
import { createPlanSlice } from './slices/plan'
import { createTimelineSlice } from './slices/timeline'
import { createWorldviewSlice } from './slices/worldview'
import { APP_STORE_DEVTOOLS_NAME } from './store.middlewares'
import type { AppStore } from './store.types'

/**
 * 唯一的主 store hook：useAppStore
 *
 * 组合顺序：每个 slice 都接收完整的 set / get，便于跨 slice 协作。
 * middleware 在此处统一包裹：
 *   - devtools 在最外层（提供 action name，调试时可在 Redux DevTools 中看到）
 *   - immer 在内层（允许 set((state) => { state.xx = yy }) 这种 draft mutation 写法）
 *
 * 禁止在单个 slice 内部单独包 middleware。
 */
export const useAppStore = create<AppStore>()(
  devtools(
    immer((...a) => ({
      ...createChaptersSlice(...a),
      ...createCharacterGraphSlice(...a),
      ...createCharacterMaterialSlice(...a),
      ...createAiEditsSlice(...a),
      ...createPlanSlice(...a),
      ...createWorldviewSlice(...a),
      ...createTimelineSlice(...a),
      ...createNovelChatSlice(...a),
      ...createChatSlice(...a),
    })),
    { name: APP_STORE_DEVTOOLS_NAME },
  ),
)
