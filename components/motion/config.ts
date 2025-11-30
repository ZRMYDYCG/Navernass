import { Transition, Variants } from "framer-motion";

// 核心动效配置
export const PAPER_TRANSITION: Transition = {
  duration: 0.25, // 250ms
  ease: [0.25, 0.8, 0.25, 1], // cubic-bezier(0.25, 0.8, 0.25, 1)
};

export const PAPER_TRANSITION_FAST: Transition = {
  duration: 0.15, // 150ms
  ease: [0.25, 0.8, 0.25, 1],
};

// 基础淡入淡出 + 轻微缩放
export const paperFadeScale: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.98,
    filter: "blur(2px)" 
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    filter: "blur(0px)",
    transition: PAPER_TRANSITION 
  },
  exit: { 
    opacity: 0, 
    scale: 0.98, 
    filter: "blur(1px)", // 退出时模糊更轻微
    transition: PAPER_TRANSITION_FAST 
  },
};

// 柔和滑动 + 淡入 (用于侧边栏或列表项)
export const paperSlideInRight: Variants = {
  initial: { 
    opacity: 0, 
    x: -8, // 8pt grid
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: PAPER_TRANSITION 
  },
  exit: { 
    opacity: 0, 
    x: -4, 
    transition: PAPER_TRANSITION_FAST 
  },
};

export const paperSlideInLeft: Variants = {
  initial: { 
    opacity: 0, 
    x: 8, // 8pt grid
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: PAPER_TRANSITION 
  },
  exit: { 
    opacity: 0, 
    x: 4, 
    transition: PAPER_TRANSITION_FAST 
  },
};

export const paperSlideInUp: Variants = {
  initial: { 
    opacity: 0, 
    y: 8, 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: PAPER_TRANSITION 
  },
  exit: { 
    opacity: 0, 
    y: 4, 
    transition: PAPER_TRANSITION_FAST 
  },
};

// 列表容器 stagger
export const paperStagger: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.03, // 非常快速的交错，避免拖沓
    },
  },
};

