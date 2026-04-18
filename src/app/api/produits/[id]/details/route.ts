import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const produit = await queryOne(`
    SELECT p.*, c.nom as categorie_nom
    FROM produits p LEFT JOIN categories c ON p.categorie_id = c.id
    WHERE p.id = ? AND p.est_actif = 1
  `, [id])
  if (!produit) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  const images = await query('SELECT * FROM produit_images WHERE produit_id = ? ORDER BY ordre ASC', [id])
  return NextResponse.json({ produit, images })
}
