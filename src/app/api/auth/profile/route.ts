import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { apiSuccess, apiUnauthorized, withErrorHandling } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const user = await authenticateRequest(request)
    
    if (!user) {
      return apiUnauthorized()
    }

    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  })
}
