import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.project.findUnique({ where: { id: params.id } })
    if (!existing) return errorResponse('PROJECT_NOT_FOUND', 'Project not found', 'abort', 404)

    const commits = await prisma.gitCommit.findMany({
      where: { projectId: params.id },
      orderBy: { date: 'desc' },
      take: 50,
    })

    const mapped = commits.map((c) => ({
      id: c.id, hash: c.hash, message: c.message,
      author: c.author, date: c.date.toISOString(),
    }))
    return successResponse(mapped)
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch commits', 'report', 500)
  }
}
