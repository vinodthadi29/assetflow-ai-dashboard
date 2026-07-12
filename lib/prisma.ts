import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

let prismaClient: PrismaClient

if (!globalForPrisma.prisma) {
  const connectionString = process.env.DATABASE_URL

  if (connectionString) {
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    
    prismaClient = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  } else {
    // Fallback for testing without database
    prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  }

  globalForPrisma.prisma = prismaClient
}

export const prisma = globalForPrisma.prisma

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
