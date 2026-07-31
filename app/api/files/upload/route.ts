import { NextRequest } from 'next/server'
import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { AppError } from '@/lib/errors/AppError'
import { createFile } from '@/services/file.service'
import { createActivity } from '@/services/activity.service'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

function sanitizeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() || 'file'
  const cleaned = base.replace(/[^\w.\-() ]/g, '_').slice(0, 200)
  return cleaned || 'file'
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      throw new AppError('VALIDATION_ERROR', 'No file uploaded', 'abort', 400)
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new AppError(
        'VALIDATION_ERROR',
        'File exceeds 20MB limit',
        'abort',
        400
      )
    }

    const projectId = formData.get('projectId')
    const taskId = formData.get('taskId')

    const filename = sanitizeFilename(file.name)
    const uniqueName = `${randomUUID()}-${filename}`
    const relativePath = path.join('uploads', uniqueName)
    const absolutePath = path.join(process.cwd(), 'storage', relativePath)

    await mkdir(path.dirname(absolutePath), { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(absolutePath, buffer)

    const asset = await createFile({
      workspaceId: 'default-workspace',
      projectId: typeof projectId === 'string' && projectId ? projectId : undefined,
      taskId: typeof taskId === 'string' && taskId ? taskId : undefined,
      filename,
      filePath: relativePath,
      storageKey: relativePath,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
    })

    // NOTE: workspaceId/actorId come from hardcoded defaults for now (auth comes in Phase 8)
    await createActivity({
      workspaceId: 'default-workspace',
      actorId: 'default-user',
      action: 'UPLOAD_FILE',
      targetType: 'file',
      targetId: asset.id,
      metadata: { filename: asset.filename, sizeBytes: asset.sizeBytes },
    })
    return successResponse(asset, 201)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
