import { NextRequest } from 'next/server'
import { Scanner } from '@/lib/scanner/index'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pathId = searchParams.get('pathId')
    const scanner = new Scanner()

    if (pathId) {
      const results = await scanner.scanPath(pathId)
      return successResponse({ results, count: results.length })
    }

    const results = await scanner.scanAll()
    return successResponse({ results, count: results.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scan failed'
    return errorResponse('INTERNAL_ERROR', message, 'report', 500)
  }
}
