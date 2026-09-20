export const CHAT_CONFIG = {
  // 滚动相关配置
  SCROLL_THRESHOLD: 100, // 距离底部多少像素时显示"回到底部"按钮
  SMOOTH_SCROLL_DURATION: 300, // 平滑滚动持续时间（毫秒）
  AUTO_SCROLL_OFFSET: 50, // 自动滚动的偏移量

  // 消息相关配置
  MESSAGE_MAX_WIDTH: '48rem', // 消息气泡最大宽度
  TYPING_SPEED: 30, // 打字机效果速度（毫秒/字符）

  // UI 配置
  AVATAR_SIZE: 32, // 头像大小
  MESSAGE_SPACING: 16, // 消息间距
} as const
