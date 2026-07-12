import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('[v0] Starting database seed...')

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@assetflow.com' },
    })

    if (existingAdmin) {
      console.log('[v0] Admin user already exists, skipping...')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin123456', 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@assetflow.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    console.log('[v0] Admin user created:', admin.email)

    // Create test asset manager
    const assetManager = await prisma.user.create({
      data: {
        email: 'manager@assetflow.com',
        name: 'Asset Manager',
        password: hashedPassword,
        role: 'ASSET_MANAGER',
      },
    })

    console.log('[v0] Asset manager created:', assetManager.email)

    // Create test employee
    const employee = await prisma.user.create({
      data: {
        email: 'employee@assetflow.com',
        name: 'Test Employee',
        password: hashedPassword,
        role: 'EMPLOYEE',
      },
    })

    console.log('[v0] Employee created:', employee.email)

    console.log('[v0] Database seed completed successfully!')
    console.log('[v0] Demo credentials:')
    console.log('[v0]   Email: admin@assetflow.com')
    console.log('[v0]   Password: Admin123456')
  } catch (error) {
    console.error('[v0] Seed error:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
