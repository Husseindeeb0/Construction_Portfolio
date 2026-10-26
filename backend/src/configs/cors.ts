import cors, { CorsOptions } from 'cors'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Parses allowed origins from environment variable or provides sensible local development defaults.
 * Supports comma-separated strings (e.g. FRONTEND_ORIGIN="http://localhost:5173,http://localhost:5174").
 */
const getAllowedOrigins = (): (string | RegExp)[] => {
  const envOrigins = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim())
    : []

  // Development fallback ports (5173, 5174, 5175, etc.) and explicit env origins
  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
  ]

  return Array.from(new Set([...defaultOrigins, ...envOrigins]))
}

export const corsOptions: CorsOptions = {
  origin: (requestOrigin, callback) => {
    const allowed = getAllowedOrigins()

    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!requestOrigin) {
      return callback(null, true)
    }

    if (allowed.includes(requestOrigin)) {
      return callback(null, true)
    }

    // In non-production, permit any localhost / 127.0.0.1 port to avoid dev friction
    if (process.env.NODE_ENV !== 'production') {
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)
      if (isLocalhost) {
        return callback(null, true)
      }
    }

    return callback(new Error(`CORS blocked for origin: ${requestOrigin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}

export const corsMiddleware = cors(corsOptions)
