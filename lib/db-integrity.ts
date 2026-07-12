/**
 * Database Integrity Checks
 * Validates data consistency and prevents race conditions
 */

import { prisma } from './prisma'

export interface IntegrityCheckResult {
  check: string
  passed: boolean
  message: string
  issues?: any[]
}

/**
 * Check for duplicate allocations for same asset
 */
export async function checkDuplicateAllocations(): Promise<IntegrityCheckResult> {
  try {
    const duplicates = await prisma.asset.findMany({
      where: {
        allocations: {
          some: {
            status: {
              in: ['APPROVED', 'PENDING'],
            },
          },
        },
      },
      include: {
        allocations: {
          where: {
            status: {
              in: ['APPROVED', 'PENDING'],
            },
          },
        },
      },
    })

    const conflicting = duplicates.filter((asset) => asset.allocations.length > 1)

    return {
      check: 'Duplicate Active Allocations',
      passed: conflicting.length === 0,
      message: `Found ${conflicting.length} assets with multiple active allocations`,
      issues: conflicting.length > 0 ? conflicting : undefined,
    }
  } catch (error) {
    return {
      check: 'Duplicate Active Allocations',
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Check for overlapping bookings
 */
export async function checkOverlappingBookings(): Promise<IntegrityCheckResult> {
  try {
    // Check for bookings with overlapping dates
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'APPROVED'],
        },
      },
    })

    const conflicts = []
    for (let i = 0; i < bookings.length; i++) {
      for (let j = i + 1; j < bookings.length; j++) {
        const b1 = bookings[i]
        const b2 = bookings[j]

        if (b1.assetId === b2.assetId) {
          const overlap =
            (b1.startDate < b2.endDate && b1.endDate > b2.startDate) ||
            (b2.startDate < b1.endDate && b2.endDate > b1.startDate)

          if (overlap) {
            conflicts.push({ booking1: b1.id, booking2: b2.id, assetId: b1.assetId })
          }
        }
      }
    }

    return {
      check: 'Overlapping Bookings',
      passed: conflicts.length === 0,
      message: `Found ${conflicts.length} overlapping bookings`,
      issues: conflicts.length > 0 ? conflicts : undefined,
    }
  } catch (error) {
    return {
      check: 'Overlapping Bookings',
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Check for orphaned records
 */
export async function checkOrphanedRecords(): Promise<IntegrityCheckResult[]> {
  const results: IntegrityCheckResult[] = []

  try {
    // Check for allocations with missing assets
    const orphanedAllocations = await prisma.allocation.findMany({
      where: {
        asset: null,
      },
    })

    results.push({
      check: 'Orphaned Allocations',
      passed: orphanedAllocations.length === 0,
      message: `Found ${orphanedAllocations.length} allocations with missing assets`,
      issues: orphanedAllocations.length > 0 ? orphanedAllocations : undefined,
    })

    // Check for bookings with missing assets
    const orphanedBookings = await prisma.booking.findMany({
      where: {
        asset: null,
      },
    })

    results.push({
      check: 'Orphaned Bookings',
      passed: orphanedBookings.length === 0,
      message: `Found ${orphanedBookings.length} bookings with missing assets`,
      issues: orphanedBookings.length > 0 ? orphanedBookings : undefined,
    })
  } catch (error) {
    results.push({
      check: 'Orphaned Records',
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
  }

  return results
}

/**
 * Check asset status consistency
 */
export async function checkAssetStatusConsistency(): Promise<IntegrityCheckResult> {
  try {
    const issues = []

    // Check for assets marked as AVAILABLE but have active allocations
    const availableWithAllocations = await prisma.asset.findMany({
      where: {
        status: 'AVAILABLE',
        allocations: {
          some: {
            status: {
              in: ['APPROVED'],
            },
          },
        },
      },
    })

    if (availableWithAllocations.length > 0) {
      issues.push({
        type: 'AVAILABLE_WITH_ALLOCATIONS',
        count: availableWithAllocations.length,
        assets: availableWithAllocations.map((a) => a.id),
      })
    }

    // Check for assets marked as IN_USE but have no active allocations
    const inUseWithoutAllocations = await prisma.asset.findMany({
      where: {
        status: 'IN_USE',
        allocations: {
          none: {
            status: {
              in: ['APPROVED'],
            },
          },
        },
      },
    })

    if (inUseWithoutAllocations.length > 0) {
      issues.push({
        type: 'IN_USE_WITHOUT_ALLOCATIONS',
        count: inUseWithoutAllocations.length,
        assets: inUseWithoutAllocations.map((a) => a.id),
      })
    }

    return {
      check: 'Asset Status Consistency',
      passed: issues.length === 0,
      message: `Found ${issues.length} asset status inconsistencies`,
      issues: issues.length > 0 ? issues : undefined,
    }
  } catch (error) {
    return {
      check: 'Asset Status Consistency',
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Run all integrity checks
 */
export async function runAllIntegrityChecks() {
  const results = {
    timestamp: new Date(),
    checks: [
      await checkDuplicateAllocations(),
      await checkOverlappingBookings(),
      await checkAssetStatusConsistency(),
      ...await checkOrphanedRecords(),
    ],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
  }

  results.summary.total = results.checks.length
  results.summary.passed = results.checks.filter((c) => c.passed).length
  results.summary.failed = results.checks.filter((c) => !c.passed).length

  return results
}
