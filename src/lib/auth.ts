import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authorization = request.headers.get('Authorization')
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice(7)
  }
  return null
}

export async function authenticateRequest(request: NextRequest) {
  const token = getTokenFromRequest(request)
  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true }
  })

  return user
}

export async function requireAuth(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireAdmin(request: NextRequest) {
  const user = await requireAuth(request)
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  return user
}
