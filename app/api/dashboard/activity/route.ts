import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { getRecentActivity } from '@/services/activity.service'

export async function GET(_req: NextRequest) {
  try {
    // NOTE: workspaceId comes from a hardcoded default for now (auth comes in Phase 8)
    const activity = await getRecentActivity('default-workspace', 20)
    return successResponse(activity)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
