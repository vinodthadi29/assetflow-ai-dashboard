import { supabase } from './supabase'

export interface AuditLogInput {
  userId?: string
  action: string
  entityType?: string
  entityId?: string
  description?: string
  metadata?: Record<string, any>
  ipAddress?: string
}

export async function logAuditActivity(input: AuditLogInput) {
  try {
    await supabase.from('activity_log').insert({
      user_id: input.userId || null,
      action: input.action,
      entity_type: input.entityType || null,
      entity_id: input.entityId || null,
      description: input.description || null,
      metadata: input.metadata || null,
      ip_address: input.ipAddress || null,
    })
  } catch (error) {
    console.error('[v0] Failed to log audit activity:', error)
  }
}
