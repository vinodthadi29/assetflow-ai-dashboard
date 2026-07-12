import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Singleton pattern for Prisma client
class PrismaClientSingleton {
  private static instance: PrismaClient | null = null

  static getInstance(): PrismaClient {
    if (!this.instance) {
      this.instance = this.createClient()
    }
    return this.instance
  }

  private static createClient(): PrismaClient {
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

    if (adapter) {
      clientConfig.adapter = adapter
    }

    return new PrismaClient(clientConfig)
  }
}

export const prisma = PrismaClientSingleton.getInstance()
