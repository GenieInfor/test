import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { verifyPassword, createToken, COOKIE_NAME_ADMIN } from '@/lib/auth'

const attempts = new Map<string, { count: number; time: number }>()

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const att = attempts.get(ip)
  if (att && att.count >= 5 && now - att.time < 30 * 60 * 1000)
    return NextResponse.json({ error: 'Trop de tentatives.' }, { status: 429 })

  const { telephone, mot_de_passe } = await req.json()
  const admin = await queryOne<any>('SELECT * FROM admins WHERE telephone = ?', [telephone])
  const valid = admin && await verifyPassword(mot_de_passe, admin.mot_de_passe)

  if (!valid) {
    attempts.set(ip, { count: (att?.count || 0) + 1, time: now })
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
  }

  attempts.delete(ip)
  const token = await createToken({ id: admin.id, telephone: admin.telephone, role: 'admin' })
  const response = NextResponse.json({ admin: { id: admin.id, nom: admin.nom } })
  response.cookies.set(COOKIE_NAME_ADMIN, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: 8 * 60 * 60, path: '/',
  })
  return response
}
