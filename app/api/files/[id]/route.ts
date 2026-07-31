import { NextRequest } from 'next/server'
import { unlink } from 'node:fs/promises'
import path from 'node:path'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { getFile, deleteFile } from '@/services/file.service'
import { createActivity } from '@/services/activity.service'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const file = await getFile(params.id)
    return successResponse(file)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actorId = request.headers.get('x-user-id') ?? 'default-user'
    const file = await deleteFile(params.id, actorId)
    // Remove the physical file if it still exists (missing file must not fail the API)
    if (file.storageKey) {
      const absolutePath = path.join(process.cwd(), 'storage', file.storageKey)
      try {
        await unlink(absolutePath)
      } catch {
        // physical file already gone — DB row deletion is what matters
      }
    }
    await createActivity({
      workspaceId: 'default-workspace',
      actorId,
      action: 'DELETE_FILE',
      targetType: 'file',
      targetId: file.id,
      metadata: { filename: file.filename },
    })
    return successResponse({ deleted: true, id: file.id })
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
