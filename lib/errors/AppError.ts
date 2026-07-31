export type ErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'

export type ErrorAction = 'retry' | 'abort' | 'report'

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly action: ErrorAction
  public readonly status: number

  constructor(
    code: ErrorCode,
    message: string,
    action: ErrorAction = 'abort',
    status: number = 400
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.action = action
    this.status = status
  }
}
