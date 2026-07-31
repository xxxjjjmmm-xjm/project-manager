import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { getTodayTasks } from '@/services/dashboard.service'

export async function GET(_req: NextRequest) {
  try {
    // NOTE: workspaceId comes from a hardcoded default for now (auth comes in Phase 8)
    const tasks = await getTodayTasks('default-workspace')
    return successResponse(tasks)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
