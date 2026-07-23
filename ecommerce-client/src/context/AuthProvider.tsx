import { useState, type ReactNode } from 'react'
import { authApi } from '../api/authApi'
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../types'
import { decodeAuthUser } from '../utils/decodeJwt'
import { normalizeRoles } from '../utils/roles'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from '../utils/tokenStorage'
import { AuthContext } from './AuthContext'

interface AuthProviderProps {
  children: ReactNode
}

function initializeUser(): AuthUser | null {
  const accessToken = getAccessToken()
  if (!accessToken) return null

  const decodedUser = decodeAuthUser(accessToken)

  if (!decodedUser) {
    clearTokens()
    return null
  }

  return decodedUser
}

function createAuthenticatedUser(data: AuthResponse, accessToken: string): AuthUser {
  const decodedUser = decodeAuthUser(accessToken)
  const roles = normalizeRoles(
    data.role
    ?? data.roles
    ?? data.user?.role
    ?? data.user?.roles,
  )
  const email = data.email
    || data.user?.email
    || decodedUser?.email
    || ''
  const responseName = data.fullName
    || data.name
    || data.user?.fullName
    || data.user?.name
    || [data.user?.firstName, data.user?.lastName].filter(Boolean).join(' ')

  return {
    id: data.id || data.user?.id || decodedUser?.id,
    email,
    name: responseName || decodedUser?.name || email || 'User',
    role: roles[0] || decodedUser?.role || '',
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initializeUser)

  async function login(request: LoginRequest): Promise<AuthResponse> {
    const response = await authApi.login(request)

    if (!response.success) {
      throw new Error(response.message || 'Unable to sign in.')
    }

    if (!response.data) {
      throw new Error('Login succeeded but no authentication data was returned.')
    }

    const accessToken = response.data.accessToken
      ?? response.data.token
      ?? response.data.jwtToken

    if (!accessToken) {
      throw new Error('Login succeeded but no access token was returned.')
    }

    saveTokens(accessToken, response.data.refreshToken)

    const authenticatedUser = createAuthenticatedUser(response.data, accessToken)
    setUser(authenticatedUser)

    return {
      ...response.data,
      accessToken,
      message: response.message || response.data.message || 'Login successful.',
    }
  }

  async function register(request: RegisterRequest): Promise<string> {
    const response = await authApi.register(request)

    if (!response.success) {
      throw new Error(response.message || response.data?.message || 'Unable to create your account.')
    }

    return response.message
      || response.data?.message
      || 'Registration successful. You can now sign in.'
  }

  async function logout(): Promise<void> {
    const refreshToken = getRefreshToken()

    clearTokens()
    setUser(null)

    if (refreshToken) {
      try {
        await authApi.revokeToken(refreshToken)
      } catch {
        // Local logout is complete even when server-side revocation fails.
      }
    }
  }

  const value = {
    user,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
