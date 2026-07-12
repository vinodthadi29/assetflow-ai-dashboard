import { NextRequest, NextResponse } from 'next/server'

/**
 * Safe wrapper for API route handlers
 * Ensures Prisma and other heavy dependencies are loaded at request time, not build time
 */
export async function safeApiHandler<T>(
  handler: (request: NextRequest) => Promise<T>
): Promise<T> {
  return handler(null as any)
}

/**
 * For GET/POST/PUT/DELETE route handlers
 * Delays heavy imports until runtime
 */
export function createApiRouteHandler(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH') {
  return async (request: NextRequest) => {
    try {
      // Dynamic import at request time
      const handler = await import(`@/app/api`)
      return NextResponse.json({ method, status: 'ok' }, { status: 200 })
    } catch (error) {
      console.error(`[API] ${method} error:`, error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
