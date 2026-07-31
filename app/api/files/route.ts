import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { listFiles } from '@/services/file.service'
import { fileQuerySchema } from '@/lib/validations/file.schema'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = fileQuerySchema.parse({
      search: searchParams.get('search') || undefined,
      projectId: searchParams.get('projectId') || undefined,
      taskId: searchParams.get('taskId') || undefined,
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    })
    // NOTE: workspaceId comes from a hardcoded default for now (auth comes in Phase 8)
    const result = await listFiles({ workspaceId: 'default-workspace', ...query })
    return successResponse(result)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
