import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const assertDatabaseConnection = async () => {
  try {
    await prisma.$connect()
    console.log('[DB SUCCESS] Connected to database successfully')
    return true
  } catch (error: any) {
    console.error(`[DB FAILED] Cannot connect to database: ${error?.message || error}`)
    return false
  }
}

export default prisma
