import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { getTask, updateTask, deleteTask } from '@/services/task.service'
import { createActivity } from '@/services/activity.service'
import { updateTaskSchema } from '@/lib/validations/task.schema'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await getTask(params.id)
    return successResponse(task)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const parsed = updateTaskSchema.parse(body)
    const task = await updateTask(params.id, parsed)
    // NOTE: workspaceId/actorId come from hardcoded defaults for now (auth comes in Phase 8)
    await createActivity({
      workspaceId: 'default-workspace',
      actorId: 'default-user',
      action: 'UPDATE_TASK',
      targetType: 'task',
      targetId: task.id,
      metadata: { title: task.title },
    })
    return successResponse(task)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await deleteTask(params.id)
    // NOTE: workspaceId/actorId come from hardcoded defaults for now (auth comes in Phase 8)
    await createActivity({
      workspaceId: 'default-workspace',
      actorId: 'default-user',
      action: 'DELETE_TASK',
      targetType: 'task',
      targetId: task.id,
      metadata: { title: task.title },
    })
    return successResponse({ deleted: true, id: task.id })
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
