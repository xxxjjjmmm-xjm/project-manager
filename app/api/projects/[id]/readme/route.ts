import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-response'
import { findReadme } from '@/lib/scanner/file-reader'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id } })
  if (!project) return errorResponse('PROJECT_NOT_FOUND', 'Project not found', 'abort', 404)

  const readme = findReadme(project.path)
  return successResponse({ content: readme })
}
