export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthUser {
  id?: string
  email: string
  name: string
  role: string
}

export interface AuthResponse {
  isSuccess?: boolean
  message?: string
  accessToken?: string
  token?: string
  jwtToken?: string
  refreshToken?: string
  expiration?: string
  id?: string
  email?: string
  name?: string
  fullName?: string
  role?: string | string[]
  roles?: string | string[]
  user?: {
    id?: string
    email?: string
    name?: string
    fullName?: string
    firstName?: string
    lastName?: string
    role?: string | string[]
    roles?: string | string[]
  }
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
}
