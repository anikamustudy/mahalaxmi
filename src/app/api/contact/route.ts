import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { apiSuccess, apiValidationError, withErrorHandling } from '@/lib/api-utils'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  subject: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
})

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin(request)
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const skip = (page - 1) * limit
    const where: any = {}
    
    if (status) {
      where.status = status
    }

    const [contacts, totalCount] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ])

    return apiSuccess({
      contacts,
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
    
    const validation = contactSchema.safeParse(body)
    if (!validation.success) {
      return apiValidationError(validation.error.errors)
    }

    const contact = await prisma.contact.create({
      data: validation.data,
    })

    // TODO: Send email notification to admin
    // This would be implemented with nodemailer or similar

    return apiSuccess(
      { message: 'Contact form submitted successfully' },
      201
    )
  })
}
