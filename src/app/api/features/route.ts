import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { apiSuccess, apiValidationError, withErrorHandling } from '@/lib/api-utils'

const featureSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon is required'),
  order: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    
    const where: any = {}
    if (published !== null) {
      where.published = published === 'true'
    }

    const features = await prisma.feature.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    return apiSuccess(features)
  })
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin(request)
    const body = await request.json()
    
    const validation = featureSchema.safeParse(body)
    if (!validation.success) {
      return apiValidationError(validation.error.errors)
    }

    const feature = await prisma.feature.create({
      data: validation.data,
    })

    return apiSuccess(feature, 201)
  })
}
