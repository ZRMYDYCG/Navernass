export type KeyToken = 'mod' | 'shift' | 'alt' | string

export function isApplePlatform() {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
    || navigator.userAgent.includes('Mac')
}

export function resolveKeyToken(token: KeyToken): string {
  if (token === 'mod') return isApplePlatform() ? '⌘' : 'Ctrl'
  if (token === 'shift') return 'Shift'
  if (token === 'alt') return isApplePlatform() ? '⌥' : 'Alt'
  return token
}

export function resolveKeyTokens(tokens: KeyToken[]): string[] {
  return tokens.map(resolveKeyToken)
}
