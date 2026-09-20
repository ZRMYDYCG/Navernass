import type { User } from '@supabase/supabase-js'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const SUPER_ADMIN_ROLE = 'super_admin' as const
export type UserRole = 'user' | typeof SUPER_ADMIN_ROLE

export interface AdminProfile {
  id: string
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
  website?: string | null
  role: UserRole
  is_protected: boolean
  created_at: string
  updated_at: string
}

export function getSuperAdminEmail() {
  return process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() || null
}

export function isConfiguredSuperAdminEmail(email?: string | null) {
  const configured = getSuperAdminEmail()
  if (!configured || !email) return false
  return email.trim().toLowerCase() === configured
}

export function isSuperAdminProfile(profile?: Pick<AdminProfile, 'role'> | null) {
  return profile?.role === SUPER_ADMIN_ROLE
}

export async function syncSuperAdminProfile(user: Pick<User, 'id' | 'email'>) {
  if (!isConfiguredSuperAdminEmail(user.email)) {
    return null
  }

  try {
    const admin = createServiceRoleClient()
    const { data: existing, error: existingError } = await admin
      .from('profiles')
      .select('id, role, is_protected')
      .eq('id', user.id)
      .maybeSingle()

    if (existingError) throw existingError

    if (!existing) {
      const { data, error } = await admin
        .from('profiles')
        .insert({
          id: user.id,
          role: SUPER_ADMIN_ROLE,
          is_protected: true,
          full_name: 'Super Admin',
        })
        .select('*')
        .single()

      if (error) throw error
      return data as AdminProfile
    }

    if (existing.role === SUPER_ADMIN_ROLE && existing.is_protected) {
      return existing as AdminProfile
    }

    const { data, error } = await admin
      .from('profiles')
      .update({
        role: SUPER_ADMIN_ROLE,
        is_protected: true,
      })
      .eq('id', user.id)
      .select('*')
      .single()

    if (error) throw error
    return data as AdminProfile
  } catch (error) {
    console.error('Failed to sync super admin profile:', error)
    return null
  }
}

export async function getServerAdminContext() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  let profile: AdminProfile | null = null

  if (isConfiguredSuperAdminEmail(user.email)) {
    profile = await syncSuperAdminProfile(user)
  } else {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    profile = (data as AdminProfile | null) ?? null
  }

  const isSuperAdmin = isSuperAdminProfile(profile) || isConfiguredSuperAdminEmail(user.email)

  if (!isSuperAdmin) {
    return null
  }

  return { user, profile }
}

export async function requireSuperAdmin() {
  const context = await getServerAdminContext()

  if (!context) {
    const unauthorizedError = new Error('Forbidden') as Error & { statusCode: number, code: string }
    unauthorizedError.statusCode = 403
    unauthorizedError.code = 'FORBIDDEN'
    throw unauthorizedError
  }

  return context
}
