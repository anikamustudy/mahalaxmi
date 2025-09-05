import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { apiSuccess, apiNotFound, apiValidationError, withErrorHandling } from '@/lib/api-utils'

const blogUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  excerpt: z.string().min(1, 'Excerpt is required').optional(),
  image: z.string().url('Invalid image URL').optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const blog = await prisma.blog.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { name: true, email: true }
        },
        tags: true,
      },
    })

    if (!blog) {
      return apiNotFound('Blog not found')
    }

    return apiSuccess(blog)
  })
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    await requireAdmin(request)
    const body = await request.json()
    
    const validation = blogUpdateSchema.safeParse(body)
    if (!validation.success) {
      return apiValidationError(validation.error.errors)
    }

    const existingBlog = await prisma.blog.findUnique({
      where: { id: params.id },
      include: { tags: true }
    })

    if (!existingBlog) {
      return apiNotFound('Blog not found')
    }

    const { tags, title, image, content, excerpt, published, featured } = validation.data

    // Generate new slug if title is being updated
    let slug = existingBlog.slug
    if (title && title !== existingBlog.title) {
      slug = generateSlug(title)
    }

    // Handle tags if provided
    let tagConnections = undefined
    if (tags !== undefined) {
      tagConnections = []
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
    }

    // Build update data object with only defined fields
    const updateData: any = {}
    if (title !== undefined) {
      updateData.title = title
      updateData.slug = slug
    }
    if (image !== undefined) updateData.image = image
    if (content !== undefined) updateData.content = content
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (published !== undefined) updateData.published = published
    if (featured !== undefined) updateData.featured = featured

    const blog = await prisma.blog.update({
      where: { id: params.id },
      data: {
        ...updateData,
        ...(tagConnections && {
          tags: {
            set: tagConnections,
          }
        }),
      },
      include: {
        author: {
          select: { name: true, email: true }
        },
        tags: true,
      },
    })

    return apiSuccess(blog)
  })
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    await requireAdmin(request)

    const existingBlog = await prisma.blog.findUnique({
      where: { id: params.id }
    })

    if (!existingBlog) {
      return apiNotFound('Blog not found')
    }

    await prisma.blog.delete({
      where: { id: params.id }
    })

    return apiSuccess({ message: 'Blog deleted successfully' })
  })
}
