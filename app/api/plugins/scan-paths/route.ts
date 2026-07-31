import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'
import { z } from 'zod'

const createSchema = z.object({ path: z.string().min(1, 'Path is required') })

export async function GET() {
  const paths = await prisma.scanPath.findMany({ orderBy: { createdAt: 'desc' } })
  return successResponse(paths)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 'abort', 400)
    const scanPath = await prisma.scanPath.create({ data: { path: parsed.data.path } })
    return successResponse(scanPath, 201)
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Failed to create scan path', 'report', 500)
  }
}
