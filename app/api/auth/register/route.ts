import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { logAuditActivity } from '@/lib/audit-logger'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['EMPLOYEE', 'DEPARTMENT_HEAD', 'ASSET_MANAGER', 'ADMIN']).default('EMPLOYEE'),
  department: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Hash password with strong salt
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Create user with all required fields
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        department: data.department || null,
        isActive: true,
        failedLoginAttempts: 0,
      },
    })

    await logAuditActivity({
      userId: 'SYSTEM',
      action: 'CREATE',
      entityType: 'User',
      entityId: user.id,
      reason: `New user registered: ${user.email}`,
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      return NextResponse.json(
        { error: 'Validation failed', details: fieldErrors },
        { status: 400 }
      )
    }

    // Handle Prisma errors
    if (error instanceof Error) {
      console.error('[v0] Register error:', error.message)
      
      // Specific error messages
      if (error.message.includes('Unique constraint failed')) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        )
      }
      
      if (error.message.includes('PrismaClientInitializationError') || 
          error.message.includes('connect ECONNREFUSED') ||
          error.message.includes('Can\'t reach database')) {
        return NextResponse.json(
          { 
            error: 'Database not configured. To use this app, please set DATABASE_URL environment variable and run: pnpm prisma migrate deploy',
            code: 'DB_NOT_CONFIGURED'
          },
          { status: 503 }
        )
      }
      
      if (error.message.includes('database')) {
        return NextResponse.json(
          { error: 'Database connection error. Please ensure DATABASE_URL is configured.' },
          { status: 503 }
        )
      }
    }

    console.error('[v0] Unexpected register error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please ensure DATABASE_URL is configured.' },
      { status: 500 }
    )
  }
}
