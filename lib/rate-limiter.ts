/**
 * Production-grade rate limiting with Redis fallback
 * Prevents brute force attacks and DoS
 */

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyPrefix?: string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for development
class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
    // Cleanup every minute
    this.startCleanup()
  }

  private startCleanup() {
    setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetTime < now) {
          this.store.delete(key)
        }
      }
    }, 60000)
  }

  async checkLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || entry.resetTime < now) {
      this.store.set(key, { count: 1, resetTime: now + this.config.windowMs })
      return { allowed: true, remaining: this.config.maxRequests - 1, resetTime: now + this.config.windowMs }
    }

    if (entry.count >= this.config.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime }
    }

    entry.count++
    return { allowed: true, remaining: this.config.maxRequests - entry.count, resetTime: entry.resetTime }
  }
}

// Redis-backed rate limiter
class RedisRateLimiter {
  private client: any
  private ready = false
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async init() {
    if (this.ready) return

    try {
      const redis = await import('redis')
      this.client = redis.createClient({
        url: process.env.REDIS_URL || process.env.DATABASE_URL,
      })

      this.client.on('error', (err: Error) => console.error('[v0] Redis limiter error:', err))
      await this.client.connect()
      this.ready = true
    } catch (error) {
      console.warn('[v0] Redis rate limiter unavailable')
      this.ready = false
    }
  }

  async checkLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    if (!this.ready) {
      return { allowed: true, remaining: this.config.maxRequests, resetTime: Date.now() + this.config.windowMs }
    }

    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      // Use Redis ZSET for time-based rate limiting
      const keyName = `${this.config.keyPrefix || 'rate-limit'}:${key}`
      const ttl = Math.ceil(this.config.windowMs / 1000)

      // Remove old entries
      await this.client.zRemRangeByScore(keyName, '-inf', windowStart)

      // Count current requests
      const count = await this.client.zCard(keyName)

      if (count >= this.config.maxRequests) {
        const oldest = await this.client.zRange(keyName, 0, 0, { withScores: true })
        const resetTime = oldest?.[1] ? Math.ceil(oldest[1] + this.config.windowMs) : now + this.config.windowMs

        return { allowed: false, remaining: 0, resetTime }
      }

      // Add current request
      await this.client.zAdd(keyName, { score: now, member: `${now}-${Math.random()}` })
      await this.client.expire(keyName, ttl)

      const remaining = this.config.maxRequests - count - 1
      const resetTime = now + this.config.windowMs

      return { allowed: true, remaining, resetTime }
    } catch (error) {
      console.error('[v0] Rate limit check error:', error)
      // Fail open to avoid blocking legitimate users
      return { allowed: true, remaining: this.config.maxRequests, resetTime: now + this.config.windowMs }
    }
  }
}

// Main rate limiter factory
export class RateLimiter {
  private inMemoryLimiter: InMemoryRateLimiter
  private redisLimiter: RedisRateLimiter | null = null
  private useRedis = false
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
    this.inMemoryLimiter = new InMemoryRateLimiter(config)
    this.redisLimiter = new RedisRateLimiter(config)

    // Try to use Redis if available
    if (process.env.REDIS_URL || process.env.DATABASE_URL) {
      this.redisLimiter.init().then(() => (this.useRedis = true))
    }
  }

  async checkLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    if (this.useRedis && this.redisLimiter) {
      return this.redisLimiter.checkLimit(key)
    }
    return this.inMemoryLimiter.checkLimit(key)
  }
}

// Pre-configured limiters for different endpoints
export const createAuthLimiter = () =>
  new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts
    keyPrefix: 'auth-limit',
  })

export const createAPILimiter = () =>
  new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    keyPrefix: 'api-limit',
  })

export const createAssetAPILimiter = () =>
  new RateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 200, // Higher for asset operations
    keyPrefix: 'asset-api-limit',
  })
