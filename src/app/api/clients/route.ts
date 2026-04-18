import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  let sql = `SELECT id, nom, prenom, telephone, ville, quartier, est_actif, created_at FROM clients`
  const params: any[] = []
  if (search) {
    sql += ` WHERE nom LIKE ? OR prenom LIKE ? OR telephone LIKE ?`
    const like = `%${search}%`
    params.push(like, like, like)
  }
  sql += ' ORDER BY created_at DESC'
  return NextResponse.json({ clients: await query(sql, params) })
}
