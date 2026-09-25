import type { AgentMessage } from "./chat-types";

type Listener = () => void;

/** 流式快照独立于页面状态，保证每个 token 只通知当前输出消息。 */
export class StreamStore {
  private message: AgentMessage | undefined;
  private readonly listeners = new Set<Listener>();

  getSnapshot = () => this.message;

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  set(message: AgentMessage | undefined) {
    this.message = message;
    this.listeners.forEach((listener) => listener());
  }
}
