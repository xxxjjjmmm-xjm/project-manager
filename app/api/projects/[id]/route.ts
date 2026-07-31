import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { getProject, updateProject, archiveProject } from '@/services/project.service'
import { updateProjectSchema } from '@/lib/validations/project.schema'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const project = await getProject(params.id)
    return successResponse(project)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const parsed = updateProjectSchema.parse(body)
    const actorId = request.headers.get('x-user-id') ?? 'default-user'
    const project = await updateProject(params.id, parsed, actorId)
    return successResponse(project)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const actorId = request.headers.get('x-user-id') ?? 'default-user'
    const result = await archiveProject(params.id, actorId)
    return successResponse({ archived: true, id: result.id })
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
