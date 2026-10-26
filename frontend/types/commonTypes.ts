export interface ImageUploadPayload {
  file: string // Base64 or binary data URI
  fileName: string
}

export interface ReorderRequest {
  direction: 'up' | 'down'
}

export interface ApiResponse<T = unknown> {
  message?: string
  data?: T
}

export interface ApiErrorResponse {
  message?: string
  error?: string
  errors?: Record<string, string[]> | string[]
}
