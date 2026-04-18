import { NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const notifications = await query(
    'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20'
  )
  const nonLues = await query('SELECT COUNT(*) as count FROM notifications WHERE lue=0')
  return NextResponse.json({ notifications, nonLues: (nonLues[0] as any)?.count || 0 })
}

export async function POST() {
  // Marquer toutes comme lues
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  await execute('UPDATE notifications SET lue=1 WHERE lue=0')
  return NextResponse.json({ success: true })
}
