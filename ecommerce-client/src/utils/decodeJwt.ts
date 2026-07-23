import type { AuthUser } from '../types'
import { normalizeRoles } from './roles'

interface JwtPayload {
  exp?: number
  sub?: string
  email?: string
  name?: string
  role?: string | string[]
  roles?: string | string[]
  [claim: string]: unknown
}

const EMAIL_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
const NAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
const NAME_ID_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'

function readString(payload: JwtPayload, ...claims: string[]) {
  for (const claim of claims) {
    const value = payload[claim]
    if (typeof value === 'string') return value
  }
  return ''
}

export function decodeAuthUser(token: string): AuthUser | null {
  try {
    const encodedPayload = token.split('.')[1]
    if (!encodedPayload) return null

    const normalized = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const payload = JSON.parse(atob(padded)) as JwtPayload

    if (payload.exp && payload.exp * 1000 <= Date.now()) return null

    const email = readString(payload, 'email', EMAIL_CLAIM)
    const name = readString(payload, 'name', NAME_CLAIM) || email || 'User'
    const rawRole = payload.role ?? payload.roles ?? payload[ROLE_CLAIM]
    const role = normalizeRoles(rawRole)[0] ?? ''

    return {
      id: readString(payload, 'sub', NAME_ID_CLAIM) || undefined,
      email,
      name,
      role,
    }
  } catch {
    return null
  }
}
