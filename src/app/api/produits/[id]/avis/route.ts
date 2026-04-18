import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const avis = await query(
    'SELECT id, nom_auteur, note, commentaire, created_at FROM avis WHERE produit_id = ? ORDER BY created_at DESC',
    [id]
  )
  return NextResponse.json({ avis })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { nom, note, commentaire, client_id } = await req.json()
  if (!nom || !note || note < 1 || note > 5)
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  await execute(
    'INSERT INTO avis (produit_id, client_id, nom_auteur, note, commentaire) VALUES (?,?,?,?,?)',
    [id, client_id || null, nom.trim().slice(0, 100), note, commentaire?.trim().slice(0, 500) || null]
  )
  return NextResponse.json({ success: true }, { status: 201 })
}
