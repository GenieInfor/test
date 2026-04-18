import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const commandes = await query(`
    SELECT
      c.numero_commande as "N° Commande",
      COALESCE(cl.nom, c.nom_invite) as "Nom",
      COALESCE(cl.prenom, c.prenom_invite) as "Prénom",
      COALESCE(cl.telephone, c.telephone_invite) as "Téléphone",
      COALESCE(cl.quartier, c.quartier_invite) as "Quartier",
      c.statut as "Statut",
      c.montant_total as "Montant (FCFA)",
      CASE WHEN c.client_id IS NOT NULL THEN 'Inscrit' ELSE 'Invité' END as "Type client",
      c.created_at as "Date"
    FROM commandes c
    LEFT JOIN clients cl ON c.client_id = cl.id
    ORDER BY c.id DESC
  `)

  // Générer CSV (compatible Excel)
  const headers = Object.keys(commandes[0] || {})
  const csvRows = [
    headers.join(';'),
    ...commandes.map(row =>
      headers.map(h => {
        const val = (row as any)[h]
        // Entourer de guillemets si contient un ;
        return typeof val === 'string' && val.includes(';') ? `"${val}"` : (val ?? '')
      }).join(';')
    )
  ]
  const csv = '\uFEFF' + csvRows.join('\n') // BOM pour Excel UTF-8

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="commandes_${new Date().toISOString().slice(0,10)}.csv"`,
    }
  })
}
