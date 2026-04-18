import { NextRequest, NextResponse } from 'next/server'
import { execute, query } from '@/lib/db'
import { getClientSession } from '@/lib/auth'

export async function GET() {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const commandes = await query(
    `SELECT c.*, GROUP_CONCAT(cl.nom_produit, ', ') as articles
     FROM commandes c LEFT JOIN commande_lignes cl ON c.id = cl.commande_id
     WHERE c.client_id = ? GROUP BY c.id ORDER BY c.id DESC`,
    [session.id]
  )
  return NextResponse.json({ commandes })
}

export async function POST(req: NextRequest) {
  try {
    const { items, montant_total, client_id, invité } = await req.json()
    if (!items || items.length === 0)
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 })

    const numero = `CMD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`

    let result: any
    if (client_id) {
      result = await execute(
        'INSERT INTO commandes (numero_commande, client_id, montant_total) VALUES (?,?,?)',
        [numero, client_id, montant_total]
      )
    } else {
      if (!invité?.nom || !invité?.prenom || !invité?.telephone || !invité?.quartier)
        return NextResponse.json({ error: 'Informations de livraison manquantes' }, { status: 400 })
      result = await execute(
        'INSERT INTO commandes (numero_commande, nom_invite, prenom_invite, telephone_invite, quartier_invite, montant_total) VALUES (?,?,?,?,?,?)',
        [numero, invité.nom, invité.prenom, invité.telephone, invité.quartier, montant_total]
      )
    }

    const commandeId = result.lastInsertRowid

    // Lignes de commande
    for (const item of items) {
      await execute(
        'INSERT INTO commande_lignes (commande_id, produit_id, nom_produit, prix_unitaire, quantite, sous_total) VALUES (?,?,?,?,?,?)',
        [commandeId, item.produit_id || null, item.nom_produit, item.prix_unitaire, item.quantite, item.sous_total]
      )
    }

    // Historique initial
    await execute(
      'INSERT INTO statuts_historique (commande_id, statut, note) VALUES (?,?,?)',
      [commandeId, 'en_attente', 'Commande reçue']
    )

    // Notification admin
    await execute(
      'INSERT INTO notifications (type, titre, message, data) VALUES (?,?,?,?)',
      [
        'nouvelle_commande',
        '🛍️ Nouvelle commande !',
        `Commande ${numero} — ${Number(montant_total).toLocaleString('fr-FR')} FCFA`,
        JSON.stringify({ commande_id: commandeId, numero, montant: montant_total })
      ]
    )

    return NextResponse.json({ numero_commande: numero, id: commandeId }, { status: 201 })
  } catch (err: any) {
    console.error('Commande error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
