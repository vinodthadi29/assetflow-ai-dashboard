import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { runAllIntegrityChecks } from '@/lib/db-integrity'

/**
 * GET /api/health
 * Production health check endpoint
 * Returns system status, database connectivity, and integrity checks
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const health = {
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {} as Record<string, any>,
    responseTime: 0,
  }

  try {
    // Check database connectivity
    let dbHealthy = false
    try {
      await prisma.user.findFirst({ take: 1 })
      health.checks.database = { status: 'connected', latency: 0 }
      dbHealthy = true
    } catch (error) {
      health.checks.database = { status: 'disconnected', error: error instanceof Error ? error.message : 'Unknown' }
      health.status = 'degraded'
    }

    // Check environment variables
    health.checks.environment = {
      hasJWTSecret: !!process.env.JWT_SECRET,
      hasRefreshSecret: !!process.env.JWT_REFRESH_SECRET,
      nodeEnv: process.env.NODE_ENV,
      databaseConfigured: !!process.env.DATABASE_URL,
    }

    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      health.status = 'degraded'
      health.checks.environment.warning = 'Missing JWT secrets'
    }

    // Run integrity checks only in detailed mode (with ?detailed=true)
    const detailed = request.nextUrl.searchParams.get('detailed') === 'true'
    if (detailed && dbHealthy) {
      try {
        const integrityResults = await runAllIntegrityChecks()
        health.checks.integrity = integrityResults

        // Mark unhealthy if critical checks failed
        if (integrityResults.summary.failed > 0) {
          health.status = 'degraded'
        }
      } catch (error) {
        health.checks.integrity = {
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }

    // Check memory usage
    if (typeof process.memoryUsage === 'function') {
      const memory = process.memoryUsage()
      health.checks.memory = {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        rss: Math.round(memory.rss / 1024 / 1024),
        external: Math.round(memory.external / 1024 / 1024),
      }
    }

    // Check Node.js version
    health.checks.nodeVersion = process.version

    health.responseTime = Date.now() - startTime

    // Return appropriate status code
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 206 : 503

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    health.status = 'unhealthy'
    health.checks.error = error instanceof Error ? error.message : 'Unknown error'
    health.responseTime = Date.now() - startTime

    return NextResponse.json(health, { status: 503 })
  }
}

/**
 * GET /api/health/ready
 * Kubernetes readiness probe
 */
export async function HEAD(request: NextRequest) {
  try {
    await prisma.user.findFirst({ take: 1 })
    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
