import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'
import { z } from 'zod'

const createSchema = z.object({ name: z.string().min(1, 'Name is required'), color: z.string().optional() })

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const withCount = searchParams.get('withCount') === 'true'
  const tags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: withCount ? { projects: true } : undefined,
  })
  const mapped = tags.map((t) => ({
    id: t.id, name: t.name, color: t.color,
    projectCount: withCount ? t.projects.length : undefined,
  }))
  return successResponse(mapped)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return errorResponse('VALIDATION_ERROR', parsed.error.issues[0].message, 'abort', 400)
    const tag = await prisma.tag.create({ data: parsed.data })
    return successResponse(tag, 201)
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Failed to create tag', 'report', 500)
  }
}
