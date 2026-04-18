import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const ADMIN_COOKIE = 'shop_admin_session'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Exclure la page de login admin et les assets
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/admin-login') ||
    pathname.startsWith('/uploads') ||
    pathname.startsWith('/images')
  ) {
    return NextResponse.next()
  }

  // Protéger toutes les routes /admin/* sauf /admin/login
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      const res = NextResponse.redirect(new URL('/admin/login', req.url))
      res.cookies.delete(ADMIN_COOKIE)
      return res
    }
  }

  // Headers de sécurité
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
