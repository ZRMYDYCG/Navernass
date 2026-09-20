type CommandGuideListener = () => void

const listeners = new Set<CommandGuideListener>()

export function subscribeEditorCommandGuide(listener: CommandGuideListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function openEditorCommandGuide() {
  listeners.forEach(listener => listener())
}
