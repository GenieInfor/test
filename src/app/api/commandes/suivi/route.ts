import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const numero = searchParams.get('numero')
  if (!numero) return NextResponse.json({ error: 'Numéro requis' }, { status: 400 })

  const commande = await queryOne(`
    SELECT c.*,
      COALESCE(cl.telephone, c.telephone_invite) as telephone,
      COALESCE(cl.quartier, c.quartier_invite) as quartier
    FROM commandes c
    LEFT JOIN clients cl ON c.client_id = cl.id
    WHERE c.numero_commande = ?
  `, [numero])

  if (!commande) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  // Lignes de commande
  const lignes = await query('SELECT * FROM commande_lignes WHERE commande_id = ?', [commande.id])

  // Historique statuts
  const historique = await query(
    'SELECT * FROM statuts_historique WHERE commande_id = ? ORDER BY created_at ASC',
    [commande.id]
  )

  return NextResponse.json({ commande: { ...commande, lignes, historique } })
}
