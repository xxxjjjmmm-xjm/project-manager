import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { listTasks, createTask } from '@/services/task.service'
import { taskQuerySchema, createTaskSchema } from '@/lib/validations/task.schema'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const query = taskQuerySchema.parse({
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      myTasks: searchParams.get('myTasks') || undefined,
      assigneeId: searchParams.get('assigneeId') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    })
    const result = await listTasks({ projectId: params.id, ...query })
    return successResponse(result)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const parsed = createTaskSchema.omit({ projectId: true }).parse(body)
    // creatorId is not in the schema; fall back to a hardcoded default until auth lands (Phase 8)
    const creatorId = typeof body?.creatorId === 'string' ? body.creatorId : 'default-user'
    const task = await createTask({
      projectId: params.id,
      creatorId,
      title: parsed.title,
      description: parsed.description,
      status: parsed.status,
      priority: parsed.priority,
      assigneeId: parsed.assigneeId ?? undefined,
      position: parsed.position,
      dueDate: parsed.dueDate,
    })
    return successResponse(task, 201)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
