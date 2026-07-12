import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

let prismaClient: PrismaClient | null = null

function getPrismaClient(): PrismaClient {
  if (prismaClient) {
    return prismaClient
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set')
  }

  const pool = new Pool({ connectionString: databaseUrl })
  const adapter = new PrismaPg(pool)

  const clientConfig: any = {
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }

  prismaClient = new PrismaClient(clientConfig)
  return prismaClient
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop: string | symbol) {
    const client = getPrismaClient()
    const value = (client as any)[prop]
    
    // Return the function or property with correct 'this' binding
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})
