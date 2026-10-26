import dotenv from 'dotenv'
import express from 'express'
import cookieParser from 'cookie-parser'
import authRoutes from './features/authentication/routes/auth.routes.js'
import companyRoutes from './features/company/routes/company.routes.js'
import heroRoutes from './features/hero/routes/hero.routes.js'
import projectRoutes from './features/projects/routes/project.routes.js'
import categoryRoutes from './features/categories/routes/category.routes.js'
import serviceRoutes from './features/services/routes/serviceSection.routes.js'
import recordRoutes from './features/records/routes/trackRecordSection.routes.js'
import aboutRoutes from './features/about/routes/about.routes.js'
import { errorHandler } from './middlewares/error.middleware.js'
import {
  startImageDeletionJob,
  stopImageDeletionJob
} from './backgroundJobs/imageDeletion/imageDeletion.job.js'
import { assertDatabaseConnection } from './configs/prisma.js'

import { corsMiddleware } from './configs/cors.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// CORS configuration supporting credentials (cookies)
app.use(corsMiddleware)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/company', companyRoutes)
app.use('/api/hero', heroRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/records', recordRoutes)
app.use('/api/about', aboutRoutes)

// Middlewares
app.use(errorHandler)

const server = app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`)
  await assertDatabaseConnection()
  // Start the background image deletion job
  startImageDeletionJob()
})

// Graceful shutdown handling
const handleShutdown = () => {
  console.log('Shutting down server...')
  stopImageDeletionJob()
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
}

process.on('SIGINT', handleShutdown)
process.on('SIGTERM', handleShutdown)

export default app
