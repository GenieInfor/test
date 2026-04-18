import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const commandes = await query(`
    SELECT c.*,
      COALESCE(cl.nom, c.nom_invite) as nom,
      COALESCE(cl.prenom, c.prenom_invite) as prenom,
      COALESCE(cl.telephone, c.telephone_invite) as telephone,
      COALESCE(cl.quartier, c.quartier_invite) as quartier,
      CASE WHEN c.client_id IS NOT NULL THEN 'inscrit' ELSE 'invité' END as type_client
    FROM commandes c
    LEFT JOIN clients cl ON c.client_id = cl.id
    ORDER BY c.id DESC
  `)
  return NextResponse.json({ commandes })
}
