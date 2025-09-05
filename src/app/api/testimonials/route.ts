import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { apiSuccess, apiValidationError, withErrorHandling } from '@/lib/api-utils'

const testimonialSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  designation: z.string().min(1, 'Designation is required'),
  company: z.string().optional(),
  image: z.string().url('Invalid image URL'),
  content: z.string().min(1, 'Content is required'),
  rating: z.number().int().min(1).max(5).default(5),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
})

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const featured = searchParams.get('featured')
    
    const where: any = {}
    if (published !== null) {
      where.published = published === 'true'
    }
    if (featured !== null) {
      where.featured = featured === 'true'
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    return apiSuccess(testimonials)
  })
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin(request)
    const body = await request.json()
    
    const validation = testimonialSchema.safeParse(body)
    if (!validation.success) {
      return apiValidationError(validation.error.errors)
    }

    const testimonial = await prisma.testimonial.create({
      data: validation.data,
    })

    return apiSuccess(testimonial, 201)
  })
}
