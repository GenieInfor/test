import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const global = await queryOne<any>(`
      SELECT
        (SELECT COUNT(*) FROM commandes WHERE statut='validée') as total_commandes,
        (SELECT COALESCE(SUM(montant_total),0) FROM commandes WHERE statut='validée') as chiffre_affaires,
        (SELECT COUNT(*) FROM clients) as total_clients,
        (SELECT COUNT(*) FROM produits WHERE est_actif=1) as total_produits,
        (SELECT COUNT(*) FROM commandes WHERE statut='en_attente') as commandes_attente
    `)
    const mensuel = await query(`
      SELECT strftime('%Y-%m', created_at) as periode,
        strftime('%m/%Y', created_at) as label,
        COUNT(*) as commandes,
        COALESCE(SUM(montant_total), 0) as chiffre
      FROM commandes WHERE statut='validée'
        AND created_at >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', created_at) ORDER BY periode ASC
    `)
    const hebdo = await query(`
      SELECT strftime('%Y-W%W', created_at) as semaine,
        date(created_at, 'weekday 1', '-6 days') as debut,
        COUNT(*) as commandes,
        COALESCE(SUM(montant_total), 0) as chiffre
      FROM commandes WHERE statut='validée'
        AND created_at >= date('now', '-56 days')
      GROUP BY strftime('%Y-%W', created_at) ORDER BY semaine ASC
    `)
    const topProduits = await query(`
      SELECT cl.nom_produit, SUM(cl.quantite) as total_vendu, SUM(cl.sous_total) as ca
      FROM commande_lignes cl JOIN commandes c ON cl.commande_id = c.id
      WHERE c.statut='validée'
      GROUP BY cl.nom_produit ORDER BY total_vendu DESC LIMIT 5
    `)
    return NextResponse.json({ global, hebdo, mensuel, topProduits })
  } catch (err) {
    console.error('Stats error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
