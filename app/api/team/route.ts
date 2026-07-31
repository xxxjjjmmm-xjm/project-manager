import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { listTeamMembers, inviteMember } from '@/services/team.service'
import { createActivity } from '@/services/activity.service'

const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']).optional(),
})

export async function GET(_req: NextRequest) {
  try {
    // NOTE: workspaceId comes from a hardcoded default for now (auth comes in Phase 8)
    const members = await listTeamMembers('default-workspace')
    return successResponse(members)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = inviteMemberSchema.parse(body)
    const member = await inviteMember('default-workspace', parsed)
    // NOTE: workspaceId/actorId come from hardcoded defaults for now (auth comes in Phase 8)
    await createActivity({
      workspaceId: 'default-workspace',
      actorId: 'default-user',
      action: 'INVITE_MEMBER',
      targetType: 'user',
      targetId: member.userId,
      metadata: { email: parsed.email, role: member.role },
    })
    return successResponse(member, 201)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
