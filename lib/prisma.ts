import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient | null }

let prismaInstance: PrismaClient | null = null

function initializePrisma(): PrismaClient {
  if (prismaInstance) {
    return prismaInstance
  }

  const connectionString = process.env.DATABASE_URL
  let adapter: any = undefined

  if (connectionString) {
    try {
      const pool = new Pool({ connectionString })
      adapter = new PrismaPg(pool)
    } catch (error) {
      console.warn(
        '[v0] Failed to initialize database adapter:',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  const clientConfig: any = {
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }

  // Only add adapter if successfully created
  if (adapter) {
    clientConfig.adapter = adapter
  }

  prismaInstance = new PrismaClient(clientConfig)
  globalForPrisma.prisma = prismaInstance

  return prismaInstance
}

// Lazy getter for Prisma client - only initializes when accessed
Object.defineProperty(global, 'prismaClient', {
  get() {
    return initializePrisma()
  },
})

export const prisma = new Proxy({} as PrismaClient, {
  get: (_target, prop) => {
    const client = initializePrisma()
    return (client as any)[prop]
  },
})
