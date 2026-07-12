import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

if (!globalForPrisma.prisma) {
  const connectionString = process.env.DATABASE_URL

  let adapter
  if (connectionString) {
    const pool = new Pool({ connectionString })
    adapter = new PrismaPg(pool)
  }

  globalForPrisma.prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
