import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const latest = searchParams.get('latest')
  const limit = latest ? parseInt(latest, 10) || 1 : 20

  const where = projectId ? { projectId } : {}
  const records = await prisma.scanRecord.findMany({
    where, orderBy: { scannedAt: 'desc' }, take: limit,
    include: { scanPath: { select: { path: true } } },
  })

  const mapped = records.map((r) => ({
    id: r.id, projectId: r.projectId, scanPathId: r.scanPathId,
    scanPath: r.scanPath.path, scannedAt: r.scannedAt.toISOString(),
    status: r.status, fileCount: r.fileCount, errorMessage: r.errorMessage,
  }))

  return successResponse(mapped)
}
