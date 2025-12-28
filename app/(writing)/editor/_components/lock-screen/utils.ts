const LOCK_SCREEN_KEY = 'editor_lock_screen'
const LOCK_TIMESTAMP_KEY = 'editor_lock_timestamp'

export function isLocked(): boolean {
  if (typeof window === 'undefined') return false
  const locked = localStorage.getItem(LOCK_SCREEN_KEY)
  return locked === 'true'
}

export function setLocked(locked: boolean): void {
  if (typeof window === 'undefined') return
  if (locked) {
    localStorage.setItem(LOCK_SCREEN_KEY, 'true')
    localStorage.setItem(LOCK_TIMESTAMP_KEY, Date.now().toString())
  } else {
    localStorage.removeItem(LOCK_SCREEN_KEY)
    localStorage.removeItem(LOCK_TIMESTAMP_KEY)
  }
}

export function getLockTimestamp(): number {
  if (typeof window === 'undefined') return 0
  const timestamp = localStorage.getItem(LOCK_TIMESTAMP_KEY)
  return timestamp ? parseInt(timestamp, 10) : 0
}

export function clearLockData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LOCK_SCREEN_KEY)
  localStorage.removeItem(LOCK_TIMESTAMP_KEY)
}
