import { NextRequest } from 'next/server'
import { z } from 'zod'
import { successResponse, errorResponse } from '@/lib/api-response'
import { handleError } from '@/lib/errors/error-handler'
import { getCalendarEvents } from '@/services/calendar.service'

const now = new Date()
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

const calendarQuerySchema = z.object({
  month: z.coerce
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format, expected YYYY-MM')
    .optional()
    .default(currentMonth),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = calendarQuerySchema.parse({
      month: searchParams.get('month') || undefined,
    })
    // NOTE: workspaceId comes from a hardcoded default for now (auth comes in Phase 8)
    const events = await getCalendarEvents('default-workspace', parsed.month)
    return successResponse(events)
  } catch (err) {
    const { code, message, action, status } = handleError(err)
    return errorResponse(code as any, message, action as any, status)
  }
}
