import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { getRecentActivity } from '@/services/activity.service'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // NOTE: workspaceId comes from a hardcoded default for now (auth comes in Phase 8)
    const activities = await getRecentActivity('default-workspace', 20, params.id)
    return successResponse(activities)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
