import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { apiSuccess, apiError, apiValidationError, withErrorHandling } from '@/lib/api-utils'

const newsletterSchema = z.object({
  email: z.string().email('Invalid email format'),
})

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin(request)
    
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const skip = (page - 1) * limit
    const where: any = {}
    
    if (active !== null) {
      where.active = active === 'true'
    }

    const [subscribers, totalCount] = await Promise.all([
      prisma.newsletter.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.newsletter.count({ where }),
    ])

    return apiSuccess({
      subscribers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  })
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json()
    
    const validation = newsletterSchema.safeParse(body)
    if (!validation.success) {
      return apiValidationError(validation.error.errors)
    }

    try {
      const subscriber = await prisma.newsletter.create({
        data: validation.data,
      })

      return apiSuccess(
        { message: 'Successfully subscribed to newsletter' },
        201
      )
    } catch (error: any) {
      if (error.code === 'P2002') {
        return apiError('Email already subscribed', 409)
      }
      throw error
    }
  })
}

export async function DELETE(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json()
    
    const validation = newsletterSchema.safeParse(body)
    if (!validation.success) {
      return apiValidationError(validation.error.errors)
    }

    await prisma.newsletter.update({
      where: { email: validation.data.email },
      data: { active: false },
    })

    return apiSuccess({ message: 'Successfully unsubscribed from newsletter' })
  })
}
