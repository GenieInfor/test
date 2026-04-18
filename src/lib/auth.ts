import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_change_me_in_production'
)

const COOKIE_NAME = process.env.COOKIE_NAME || 'shop_session'
const ADMIN_COOKIE = 'shop_admin_session'

export interface TokenPayload {
  id: number
  telephone: string
  role: 'client' | 'admin'
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}

// Next.js 15 : cookies() doit être await
export async function getClientSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getAdminSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') return null
  return payload
}

export function validatePhone(phone: string): boolean {
  return /^[0-9+\s\-]{8,20}$/.test(phone)
}

export function validateName(name: string): boolean {
  return /^[a-zA-ZÀ-ÿ\s\-']{2,100}$/.test(name)
}

export function validatePassword(password: string): boolean {
  return password.length >= 8 && /\d/.test(password)
}

export function sanitize(input: string): string {
  return input.trim().replace(/[<>'"]/g, '')
}

export const COOKIE_NAME_CLIENT = COOKIE_NAME
export const COOKIE_NAME_ADMIN = ADMIN_COOKIE
