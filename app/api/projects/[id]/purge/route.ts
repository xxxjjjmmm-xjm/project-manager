import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { deleteProject } from '@/services/project.service'

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteProject(params.id)
    return successResponse({ purged: true })
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
