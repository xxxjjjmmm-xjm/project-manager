import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { listProjects, createProject } from '@/services/project.service'
import { createActivity } from '@/services/activity.service'
import { projectQuerySchema, createProjectSchema } from '@/lib/validations/project.schema'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = projectQuerySchema.parse({
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    })
    // NOTE: workspaceId comes from a hardcoded default for now (auth comes in Phase 8)
    const result = await listProjects({ workspaceId: 'default-workspace', ...query })
    return successResponse(result)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createProjectSchema.parse(body)
    const project = await createProject({
      workspaceId: parsed.workspaceId,
      ownerId: parsed.ownerId,
      name: parsed.name,
      description: parsed.description,
      status: parsed.status,
      priority: parsed.priority,
      dueDate: parsed.dueDate,
    })
    // Log activity
    await createActivity({
      workspaceId: parsed.workspaceId,
      actorId: parsed.ownerId,
      action: 'CREATE_PROJECT',
      targetType: 'project',
      targetId: project.id,
      metadata: { name: project.name },
    })
    return successResponse(project, 201)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
