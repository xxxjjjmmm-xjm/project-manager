import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { getWorkspace, updateWorkspace } from '@/services/workspace.service'
import { createActivity } from '@/services/activity.service'
import { workspaceSchema } from '@/lib/validations/workspace.schema'

export async function GET(_req: NextRequest) {
  try {
    // NOTE: workspaceId comes from a hardcoded default for now (auth comes in Phase 8)
    const workspace = await getWorkspace('default-workspace')
    return successResponse(workspace)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = workspaceSchema.parse(body)
    const workspace = await updateWorkspace('default-workspace', parsed)
    // NOTE: workspaceId/actorId come from hardcoded defaults for now (auth comes in Phase 8)
    await createActivity({
      workspaceId: workspace.id,
      actorId: 'default-user',
      action: 'UPDATE_WORKSPACE',
      targetType: 'workspace',
      targetId: workspace.id,
      metadata: { name: workspace.name },
    })
    return successResponse(workspace)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
