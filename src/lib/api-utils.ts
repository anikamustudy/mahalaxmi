import { NextResponse } from 'next/server'

export function apiSuccess(data: any, status: number = 200) {
  return NextResponse.json({
    success: true,
    data,
  }, { status })
}

export function apiError(message: string, status: number = 400, errors?: any) {
  return NextResponse.json({
    success: false,
    message,
    errors,
  }, { status })
}

export function apiNotFound(message: string = 'Resource not found') {
  return apiError(message, 404)
}

export function apiUnauthorized(message: string = 'Unauthorized') {
  return apiError(message, 401)
}

export function apiForbidden(message: string = 'Forbidden') {
  return apiError(message, 403)
}

export function apiValidationError(errors: any) {
  return apiError('Validation error', 400, errors)
}

export async function withErrorHandling(handler: () => Promise<NextResponse>) {
  try {
    return await handler()
  } catch (error) {
    console.error('API Error:', error)
    return apiError('Internal server error', 500)
  }
}
