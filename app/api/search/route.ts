import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { globalSearch } from '@/services/search.service'

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Query is required'),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = searchQuerySchema.parse({
      q: searchParams.get('q') || undefined,
      limit: searchParams.get('limit') || undefined,
    })
    // NOTE: workspaceId comes from a hardcoded default for now (auth comes in Phase 8)
    const result = await globalSearch('default-workspace', parsed.q, parsed.limit)
    return successResponse(result)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
