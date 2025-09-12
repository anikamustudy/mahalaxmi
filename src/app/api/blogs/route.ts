import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { apiSuccess, apiValidationError, withErrorHandling } from '@/lib/api-utils'

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  image: z.string().url('Invalid image URL'),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).optional().default([]),
})

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const published = searchParams.get('published')
    const featured = searchParams.get('featured')
    const tag = searchParams.get('tag')
    
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (published !== null) {
      where.published = published === 'true'
    }
    
    if (featured !== null) {
      where.featured = featured === 'true'
    }
    
    if (tag) {
      where.tags = {
        some: {
          slug: tag
        }
      }
    }

    const [blogs, totalCount] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: {
          author: {
            select: { name: true, email: true }
          },
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ])

    return apiSuccess({
      blogs,
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
    const user = await requireAdmin(request)
    const body = await request.json()
    
    const validation = blogSchema.safeParse(body)
    if (!validation.success) {
      return apiValidationError(validation.error.errors)
    }

    const { tags, ...blogData } = validation.data
    const slug = generateSlug(blogData.title)

    // Create or connect tags
    const tagConnections = []
    for (const tagName of tags) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: {
          name: tagName,
          slug: tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        },
      })
      tagConnections.push({ id: tag.id })
    }

    const blog = await prisma.blog.create({
      data: {
        ...blogData,
        slug,
        authorId: user.id,
        tags: {
          connect: tagConnections,
        },
      },
      include: {
        author: {
          select: { name: true, email: true }
        },
        tags: true,
      },
    })

    return apiSuccess(blog, 201)
  })
}
