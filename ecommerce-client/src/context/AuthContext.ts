import { createContext } from 'react'
import type { AuthState, AuthResponse, LoginRequest, RegisterRequest } from '../types'

export interface AuthContextValue extends AuthState {
  login: (request: LoginRequest) => Promise<AuthResponse>
  register: (request: RegisterRequest) => Promise<string>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
