import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../types'
import { axiosClient } from './axiosClient'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function readRoles(value: unknown): string | string[] | undefined {
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return undefined
  return value.filter((role): role is string => typeof role === 'string')
}

function normalizeUser(value: unknown): AuthResponse['user'] {
  if (!isRecord(value)) return undefined

  return {
    id: readString(value.id),
    email: readString(value.email),
    name: readString(value.name),
    fullName: readString(value.fullName),
    firstName: readString(value.firstName),
    lastName: readString(value.lastName),
    role: readRoles(value.role),
    roles: readRoles(value.roles),
  }
}

function normalizeAuthData(value: unknown): AuthResponse | null {
  if (!isRecord(value)) return null

  return {
    isSuccess: typeof value.isSuccess === 'boolean' ? value.isSuccess : undefined,
    message: readString(value.message),
    accessToken: readString(value.accessToken),
    token: readString(value.token),
    jwtToken: readString(value.jwtToken),
    refreshToken: readString(value.refreshToken),
    expiration: readString(value.expiration),
    id: readString(value.id),
    email: readString(value.email),
    name: readString(value.name),
    fullName: readString(value.fullName),
    role: readRoles(value.role),
    roles: readRoles(value.roles),
    user: normalizeUser(value.user),
  }
}

function normalizeApiResponse(payload: unknown): ApiResponse<AuthResponse | null> {
  if (!isRecord(payload)) {
    return {
      success: false,
      message: 'The server returned an invalid authentication response.',
      data: null,
    }
  }

  if (typeof payload.success === 'boolean') {
    return {
      success: payload.success,
      message: readString(payload.message),
      data: normalizeAuthData(payload.data),
    }
  }

  const data = normalizeAuthData(payload)

  return {
    success: payload.isSuccess !== false,
    message: readString(payload.message) || data?.message,
    data,
  }
}

export const authApi = {
  async login(request: LoginRequest): Promise<ApiResponse<AuthResponse | null>> {
    const response = await axiosClient.post<unknown>('/api/auth/login', request)
    return normalizeApiResponse(response.data)
  },

  async register(request: RegisterRequest): Promise<ApiResponse<AuthResponse | null>> {
    const response = await axiosClient.post<unknown>('/api/auth/register', request)
    return normalizeApiResponse(response.data)
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse | null>> {
    const response = await axiosClient.post<unknown>('/api/auth/refresh-token', { refreshToken })
    return normalizeApiResponse(response.data)
  },

  async revokeToken(refreshToken: string): Promise<void> {
    await axiosClient.post<unknown>('/api/auth/revoke-token', { refreshToken })
  },
}
