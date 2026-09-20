import type { AnimateOptions } from 'streamdown'

/** 流式字符闪光：见 https://streamdown.ai/docs/animation */
export const STREAM_ANIMATION: AnimateOptions = {
  animation: 'shimmerIn',
  duration: 280,
  easing: 'ease-out',
  sep: 'char',
  stagger: 16,
}
