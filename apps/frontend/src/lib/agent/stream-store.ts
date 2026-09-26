import type { AgentMessage } from "./chat-types";

type Listener = () => void;

/**
 * 通知节流：逐字动画会为每个字符挂载 span，token 级高频重渲染容易把
 * 渲染树压爆栈（Maximum call stack）。等价于 useChat 调高
 * experimental_throttle——动画卡顿/报栈时优先调大这个间隔。
 */
const NOTIFY_THROTTLE_MS = 100;

/** 流式快照独立于页面状态，保证每个 token 只通知当前输出消息。 */
export class StreamStore {
  private message: AgentMessage | undefined;
  private readonly listeners = new Set<Listener>();
  private timer: ReturnType<typeof setTimeout> | undefined;

  getSnapshot = () => this.message;

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** 首帧立即广播，节流窗口内的后续 token 合并为窗口末尾的一次通知。 */
  set(message: AgentMessage | undefined) {
    this.message = message;
    if (this.timer !== undefined) return;
    this.notify();
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.notify();
    }, NOTIFY_THROTTLE_MS);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}
