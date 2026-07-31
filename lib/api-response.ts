import { NextResponse } from 'next/server'
import type { ApiResponse, ErrorAction, ErrorCode, PaginationMeta } from './types'

export function successResponse<T>(data: T, status: number = 200): NextResponse {
  const body: ApiResponse<T> = { success: true, data, error: null }
  return NextResponse.json(body, { status })
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  action: ErrorAction,
  status: number = 400
): NextResponse {
  const body: ApiResponse<null> = {
    success: false,
    data: null,
    error: { code, message, action },
  }
  return NextResponse.json(body, { status })
}

export function paginatedResponse<T>(
  data: T,
  pagination: PaginationMeta
): NextResponse {
  const body: ApiResponse<T> = {
    success: true,
    data,
    error: null,
    pagination,
  }
  return NextResponse.json(body)
}
