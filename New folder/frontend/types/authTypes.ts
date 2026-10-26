export interface User {
  id: number
  email: string
  role: 'ADMIN' | 'USER'
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  message: string
}

export interface SigninRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  role?: 'ADMIN' | 'USER'
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
