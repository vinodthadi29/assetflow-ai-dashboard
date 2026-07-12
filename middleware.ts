import { NextRequest, NextResponse } from 'next/server'
import { addSecurityHeaders } from './lib/security-middleware'

// Protected routes that require authentication
const protectedRoutes = [
  '/api/assets',
  '/api/allocations',
  '/api/bookings',
  '/api/maintenance',
  '/api/audits',
  '/api/audit-logs',
  '/api/notifications',
  '/api/search',
]

// Public routes
const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/api/auth/refresh']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return handlePublicRoute(request)
  }

  // Check protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = request.headers.get('authorization')?.split('Bearer ')[1]

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return handleResponse(request, NextResponse.next())
}

function handlePublicRoute(request: NextRequest): NextResponse {
  return handleResponse(request, NextResponse.next())
}

function handleResponse(request: NextRequest, response: NextResponse): NextResponse {
  // Add security headers
  const headers = new Headers(response.headers)

  // CORS headers - only allow configured origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  const origin = request.headers.get('origin')

  if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    headers.set('Access-Control-Allow-Credentials', 'true')
    headers.set('Access-Control-Max-Age', '86400')
  }

  // Security headers
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-XSS-Protection', '1; mode=block')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Content Security Policy
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; upgrade-insecure-requests"
  )

  // Additional security headers
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export const config = {
  matcher: [
    // Protected API routes
    '/api/:path*',
    // Protected pages
    '/dashboard/:path*',
    '/assets/:path*',
    '/allocations/:path*',
    '/bookings/:path*',
    '/maintenance/:path*',
    '/audits/:path*',
    '/reports/:path*',
    '/analytics/:path*',
    '/settings/:path*',
  ],
}
