import { AppError } from './AppError'
import type { ErrorAction, ErrorCode } from './AppError'

export interface ErrorResult {
  code: ErrorCode
  message: string
  action: ErrorAction
  status: number
}

export function handleError(err: unknown): ErrorResult {
  // AppError — use directly
  if (err instanceof AppError) {
    return {
      code: err.code,
      message: err.message,
      action: err.action,
      status: err.status,
    }
  }

  // Prisma unique constraint violation
  if (err instanceof Error && err.message.includes('Unique constraint')) {
    return {
      code: 'CONFLICT',
      message: 'Resource already exists',
      action: 'abort',
      status: 409,
    }
  }

  // Prisma not found
  if (
    err instanceof Error &&
    err.message.includes('Record to update not found')
  ) {
    return {
      code: 'NOT_FOUND',
      message: 'Resource not found',
      action: 'abort',
      status: 404,
    }
  }

  // Generic fallback
  const message =
    err instanceof Error ? err.message : 'Internal server error'
  return {
    code: 'INTERNAL_ERROR',
    message,
    action: 'report',
    status: 500,
  }
}
