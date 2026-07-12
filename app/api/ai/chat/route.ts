import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { withAuth, AuthToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'
import { z } from 'zod'

const tools = {
  getAssets: {
    description: 'Get a list of assets with optional filtering',
    parameters: z.object({
      category: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().optional(),
    }),
  },
  allocateAsset: {
    description: 'Allocate an asset to a user or department',
    parameters: z.object({
      assetId: z.string(),
      assignedTo: z.string(),
      departmentId: z.string(),
      reason: z.string().optional(),
    }),
  },
  createMaintenanceTicket: {
    description: 'Create a maintenance ticket for an asset',
    parameters: z.object({
      assetId: z.string(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      description: z.string(),
    }),
  },
  getAssetStatus: {
    description: 'Get the current status and details of a specific asset',
    parameters: z.object({
      assetId: z.string(),
    }),
  },
  createBooking: {
    description: 'Book a resource for a specific time period',
    parameters: z.object({
      resourceId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      purpose: z.string().optional(),
    }),
  },
}

async function processToolCall(
  toolName: string,
  params: any,
  userId: string
): Promise<string> {
  try {
    switch (toolName) {
      case 'getAssets': {
        const assets = await prisma.asset.findMany({
          where: {
            ...(params.category && { category: params.category }),
            ...(params.status && { status: params.status }),
            deletedAt: null,
          },
          take: params.limit || 10,
        })
        return JSON.stringify(assets)
      }

      case 'allocateAsset': {
        const allocation = await prisma.allocation.create({
          data: {
            assetId: params.assetId,
            allocatedBy: userId,
            assignedTo: params.assignedTo,
            departmentId: params.departmentId,
            reason: params.reason,
            status: 'PENDING',
            allocationDate: new Date(),
          },
        })

        await logAuditActivity({
          userId,
          action: 'CREATE',
          entityType: 'Allocation',
          entityId: allocation.id,
          reason: `AI: Allocated asset ${params.assetId} to ${params.assignedTo}`,
        })

        return JSON.stringify({ success: true, allocationId: allocation.id })
      }

      case 'createMaintenanceTicket': {
        const ticket = await prisma.maintenanceTicket.create({
          data: {
            assetId: params.assetId,
            priority: params.priority,
            description: params.description,
            createdBy: userId,
            status: 'OPEN',
            createdAt: new Date(),
          },
        })

        await logAuditActivity({
          userId,
          action: 'CREATE',
          entityType: 'MaintenanceTicket',
          entityId: ticket.id,
          reason: `AI: Created maintenance ticket for asset ${params.assetId}`,
        })

        return JSON.stringify({ success: true, ticketId: ticket.id })
      }

      case 'getAssetStatus': {
        const asset = await prisma.asset.findUnique({
          where: { id: params.assetId },
          include: {
            allocations: {
              where: { status: { in: ['ACTIVE', 'PENDING'] } },
            },
            maintenanceTickets: {
              where: { status: 'OPEN' },
            },
          },
        })
        return JSON.stringify(asset)
      }

      case 'createBooking': {
        const booking = await prisma.booking.create({
          data: {
            resourceId: params.resourceId,
            bookedBy: userId,
            startDate: new Date(params.startDate),
            endDate: new Date(params.endDate),
            purpose: params.purpose,
            status: 'CONFIRMED',
          },
        })

        await logAuditActivity({
          userId,
          action: 'CREATE',
          entityType: 'Booking',
          entityId: booking.id,
          reason: `AI: Created booking for ${params.purpose || 'resource'}`,
        })

        return JSON.stringify({ success: true, bookingId: booking.id })
      }

      default:
        return JSON.stringify({ error: 'Unknown tool' })
    }
  } catch (error) {
    console.error('[v0] Tool execution error:', error)
    return JSON.stringify({ error: 'Tool execution failed' })
  }
}

export async function POST(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const body = await req.json()
      const { message } = body

      if (!message) {
        return NextResponse.json({ error: 'Message required' }, { status: 400 })
      }

      const systemPrompt = `You are AssetFlow AI, an intelligent enterprise asset management assistant. You help users manage assets, allocations, bookings, and maintenance through natural language.

Available actions:
- getAssets: Search for assets by category or status
- allocateAsset: Allocate assets to users or departments
- createMaintenanceTicket: Report and track maintenance needs
- getAssetStatus: Check asset details and current allocation
- createBooking: Reserve resources for specific periods

Current user: ${auth.email}
User role: ${auth.role}

Always:
1. Ask for clarification if information is ambiguous
2. Confirm actions before executing
3. Provide clear summaries of completed actions
4. Suggest relevant follow-up actions`

      const response = await generateText({
        model: anthropic('claude-3-5-sonnet-20241022'),
        system: systemPrompt,
        prompt: message,
        tools: tools as any,
        maxToolRoundtrips: 5,
        onToolCall: async (toolCall: any) => {
          const result = await processToolCall(toolCall.toolName, toolCall.args, auth.userId)
          return result
        },
      })

      await logAuditActivity({
        userId: auth.userId,
        action: 'VIEW',
        entityType: 'AICopilot',
        entityId: 'CHAT',
        reason: `User queried AI: ${message.substring(0, 50)}...`,
      })

      return NextResponse.json({
        success: true,
        message: response.text,
        toolsUsed: response.toolResults?.map((r: any) => r.toolName) || [],
      })
    } catch (error) {
      console.error('[v0] AI copilot error:', error)
      return NextResponse.json({ success: false, error: 'AI processing failed' }, { status: 500 })
    }
  })(request)
}
