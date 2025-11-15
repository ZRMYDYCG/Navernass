/**
 * 锁屏相关的工具函数
 */

const LOCK_SCREEN_KEY = 'editor_lock_screen'
const LOCK_PASSWORD_KEY = 'editor_lock_password'
const LOCK_TIMESTAMP_KEY = 'editor_lock_timestamp'

/**
 * 简单的密码加密（Base64编码，实际项目中应使用更安全的加密方式）
 */
function encodePassword(password: string): string {
  if (typeof window === 'undefined') return ''
  return btoa(password)
}

/**
 * 密码解密
 */
function decodePassword(encoded: string): string {
  if (typeof window === 'undefined') return ''
  try {
    return atob(encoded)
  } catch {
    return ''
  }
}

/**
 * 检查是否已设置密码
 */
export function hasPassword(): boolean {
  if (typeof window === 'undefined') return false
  const password = localStorage.getItem(LOCK_PASSWORD_KEY)
  return !!password && password.length > 0
}

/**
 * 设置锁屏密码
 */
export function setPassword(password: string): void {
  if (typeof window === 'undefined') return
  if (password.trim().length === 0) {
    localStorage.removeItem(LOCK_PASSWORD_KEY)
    return
  }
  const encoded = encodePassword(password.trim())
  localStorage.setItem(LOCK_PASSWORD_KEY, encoded)
}

/**
 * 验证密码
 */
export function verifyPassword(password: string): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(LOCK_PASSWORD_KEY)
  if (!stored) return false
  const decoded = decodePassword(stored)
  return decoded === password.trim()
}

/**
 * 检查是否处于锁屏状态
 */
export function isLocked(): boolean {
  if (typeof window === 'undefined') return false
  const locked = localStorage.getItem(LOCK_SCREEN_KEY)
  return locked === 'true'
}

/**
 * 设置锁屏状态
 */
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

/**
 * 获取锁屏时间戳
 */
export function getLockTimestamp(): number {
  if (typeof window === 'undefined') return 0
  const timestamp = localStorage.getItem(LOCK_TIMESTAMP_KEY)
  return timestamp ? parseInt(timestamp, 10) : 0
}

/**
 * 清除所有锁屏相关数据
 */
export function clearLockData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LOCK_SCREEN_KEY)
  localStorage.removeItem(LOCK_PASSWORD_KEY)
  localStorage.removeItem(LOCK_TIMESTAMP_KEY)
}

