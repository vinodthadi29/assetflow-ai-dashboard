import { NextRequest, NextResponse } from 'next/server'
import { RateLimiter } from 'limiter'
import crypto from 'crypto'

// Rate limiter for API endpoints
const apiLimiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'min',
})

// Stricter rate limiter for auth endpoints
const authLimiter = new RateLimiter({
  tokensPerInterval: 5,
  interval: 'min',
})

// Token blacklist (in production, use Redis)
const tokenBlacklist = new Set<string>()

/**
 * Add security headers to response
 * Prevents common attacks: XSS, CSRF, Clickjacking, etc.
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'"
  )
  return response
}

/**
 * CORS middleware
 */
export function corsMiddleware(request: NextRequest, allowedOrigins: string[] = ['http://localhost:3000']): NextRequest | NextResponse {
  const origin = request.headers.get('origin')

  if (origin && !allowedOrigins.includes(origin)) {
    return new NextResponse('CORS error', { status: 403 })
  }

  return request
}

/**
 * Rate limiting middleware
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  endpoint: 'api' | 'auth' = 'api'
): Promise<{ allowed: boolean; remaining: number }> {
  const limiter = endpoint === 'auth' ? authLimiter : apiLimiter
  const clientId = request.ip || 'unknown'

  try {
    const remaining = await limiter.removeTokens(1)
    return { allowed: remaining >= 0, remaining: Math.max(0, remaining) }
  } catch {
    return { allowed: false, remaining: 0 }
  }
}

/**
 * CSRF token generation and validation
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken))
}

/**
 * Token blacklist management
 */
export function blacklistToken(token: string): void {
  tokenBlacklist.add(token)
}

export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token)
}

/**
 * Request signing for webhook security
 */
export function signRequest(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export function verifyRequestSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = signRequest(payload, secret)
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

/**
 * Input sanitization
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '\\$&') // Escape quotes
    .trim()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Hash password (use bcryptjs in production)
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.hash(password, 12)
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 12) errors.push('Password must be at least 12 characters')
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter')
  if (!/[0-9]/.test(password)) errors.push('Password must contain number')
  if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special character')

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: { name: string; size: number },
  options: { maxSize?: number; allowedTypes?: string[] } = {}
): { valid: boolean; error?: string } {
  const maxSize = options.maxSize || 50 * 1024 * 1024 // 50MB default
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'application/pdf']

  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` }
  }

  // Check file extension
  const ext = file.name.split('.').pop()?.toLowerCase()
  const forbiddenExts = ['exe', 'bat', 'cmd', 'sh', 'sh', 'js', 'php', 'asp']
  if (ext && forbiddenExts.includes(ext)) {
    return { valid: false, error: 'File type not allowed' }
  }

  return { valid: true }
}
