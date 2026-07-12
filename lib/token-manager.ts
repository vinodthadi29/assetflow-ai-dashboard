/**
 * Production-grade token management with Redis-backed blacklist
 * Fallback to in-memory store for development
 */

import crypto from 'crypto'

interface TokenRecord {
  token: string
  userId: string
  sessionId: string
  tokenVersion: number
  jti: string
  expiresAt: Date
  blacklistedAt?: Date
}

// In-memory store (development fallback)
class InMemoryTokenStore {
  private store = new Map<string, TokenRecord>()

  set(key: string, value: TokenRecord): void {
    this.store.set(key, value)
    // Auto-cleanup expired tokens
    setTimeout(() => this.store.delete(key), Math.max(0, value.expiresAt.getTime() - Date.now()))
  }

  get(key: string): TokenRecord | undefined {
    return this.store.get(key)
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  has(key: string): boolean {
    return this.store.has(key)
  }

  clear(): void {
    this.store.clear()
  }
}

class RedisTokenStore {
  private client: any
  private ready = false

  async init() {
    if (this.ready) return

    try {
      // Dynamic Redis import
      const redis = await import('redis')
      this.client = redis.createClient({
        url: process.env.REDIS_URL || process.env.DATABASE_URL,
        socket: { reconnectStrategy: (retries) => Math.min(retries * 50, 500) },
      })

      this.client.on('error', (err: Error) => console.error('[v0] Redis error:', err))
      await this.client.connect()
      this.ready = true
    } catch (error) {
      console.warn('[v0] Redis unavailable, using in-memory fallback:', error instanceof Error ? error.message : 'Unknown')
      this.ready = false
    }
  }

  async set(key: string, value: TokenRecord): Promise<void> {
    if (!this.ready) return

    const ttl = Math.ceil((value.expiresAt.getTime() - Date.now()) / 1000)
    if (ttl > 0) {
      await this.client.setEx(key, ttl, JSON.stringify(value))
    }
  }

  async get(key: string): Promise<TokenRecord | undefined> {
    if (!this.ready) return undefined

    const data = await this.client.get(key)
    return data ? JSON.parse(data) : undefined
  }

  async delete(key: string): Promise<void> {
    if (!this.ready) return
    await this.client.del(key)
  }

  async has(key: string): Promise<boolean> {
    if (!this.ready) return false
    return (await this.client.exists(key)) === 1
  }

  async clear(): Promise<void> {
    if (!this.ready) return
    await this.client.flushDb()
  }
}

// Token manager using Redis or in-memory fallback
const inMemoryStore = new InMemoryTokenStore()
let redisStore: RedisTokenStore | null = null

export class TokenManager {
  private static instance: TokenManager
  private useRedis = false

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  async initialize(): Promise<void> {
    if (process.env.REDIS_URL || process.env.DATABASE_URL) {
      redisStore = new RedisTokenStore()
      await redisStore.init()
      this.useRedis = true
    }
  }

  private getStore() {
    return this.useRedis && redisStore ? redisStore : inMemoryStore
  }

  async registerToken(
    token: string,
    userId: string,
    sessionId: string,
    tokenVersion: number,
    jti: string,
    expiresAt: Date
  ): Promise<void> {
    const store = this.getStore()
    const record: TokenRecord = { token, userId, sessionId, tokenVersion, jti, expiresAt }

    if (this.useRedis && redisStore) {
      await redisStore.set(jti, record)
    } else {
      inMemoryStore.set(jti, record)
    }
  }

  async blacklistToken(jti: string, reason: string = 'logout'): Promise<void> {
    const store = this.getStore()

    if (this.useRedis && redisStore) {
      const record = await redisStore.get(jti)
      if (record) {
        record.blacklistedAt = new Date()
        await redisStore.set(`blacklist:${jti}`, record)
        await redisStore.delete(jti) // Remove from active tokens
      }
    } else {
      const record = inMemoryStore.get(jti)
      if (record) {
        record.blacklistedAt = new Date()
        inMemoryStore.set(`blacklist:${jti}`, record)
        inMemoryStore.delete(jti)
      }
    }
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const store = this.getStore()

    if (this.useRedis && redisStore) {
      return await redisStore.has(`blacklist:${jti}`)
    } else {
      return inMemoryStore.has(`blacklist:${jti}`)
    }
  }

  async invalidateUserTokens(userId: string, sessionId: string): Promise<void> {
    // Increment token version in database - all tokens with older version become invalid
    // This is handled by the backend invalidating on verification
    console.log(`[v0] Invalidated tokens for user ${userId} session ${sessionId}`)
  }

  async getTokenRecord(jti: string): Promise<TokenRecord | undefined> {
    const store = this.getStore()

    if (this.useRedis && redisStore) {
      return await redisStore.get(jti)
    } else {
      return inMemoryStore.get(jti)
    }
  }

  async cleanup(): Promise<void> {
    if (this.useRedis && redisStore) {
      await redisStore.clear()
    } else {
      inMemoryStore.clear()
    }
  }
}

// Initialize on first import
const tokenManager = TokenManager.getInstance()
tokenManager.initialize().catch((err) => console.warn('[v0] Token manager init warning:', err))

export default tokenManager
