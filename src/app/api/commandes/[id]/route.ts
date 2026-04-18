import { NextRequest, NextResponse } from 'next/server'
import { execute, query, queryOne } from '@/lib/db'
import { getAdminSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  const { statut, note } = await req.json()

  if (!['en_attente', 'validée', 'annulée'].includes(statut))
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })

  const commande = await queryOne<any>('SELECT * FROM commandes WHERE id = ?', [id])
  if (!commande) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  // Mettre à jour le statut
  await execute("UPDATE commandes SET statut=?, updated_at=datetime('now') WHERE id=?", [statut, id])

  // Enregistrer dans l'historique
  await execute(
    'INSERT INTO statuts_historique (commande_id, statut, note) VALUES (?,?,?)',
    [id, statut, note || null]
  )

  // Gestion stock automatique
  if (statut === 'validée' && commande.statut !== 'validée') {
    // Décrémentation du stock quand on valide
    const lignes = await query<any>('SELECT * FROM commande_lignes WHERE commande_id = ?', [id])
    for (const ligne of lignes) {
      if (ligne.produit_id) {
        await execute(
          'UPDATE produits SET stock = MAX(0, stock - ?), updated_at = datetime(\'now\') WHERE id = ?',
          [ligne.quantite, ligne.produit_id]
        )
        // Désactiver si stock = 0
        await execute(
          "UPDATE produits SET est_actif = CASE WHEN stock <= 0 THEN 0 ELSE est_actif END WHERE id = ?",
          [ligne.produit_id]
        )
      }
    }
  } else if (statut === 'annulée' && commande.statut === 'validée') {
    // Restaurer le stock si on annule une commande validée
    const lignes = await query<any>('SELECT * FROM commande_lignes WHERE commande_id = ?', [id])
    for (const ligne of lignes) {
      if (ligne.produit_id) {
        await execute(
          "UPDATE produits SET stock = stock + ?, est_actif = 1, updated_at = datetime('now') WHERE id = ?",
          [ligne.quantite, ligne.produit_id]
        )
      }
    }
  }

  // Créer une notification admin
  await execute(
    'INSERT INTO notifications (type, titre, message, data) VALUES (?,?,?,?)',
    [
      'commande',
      `Commande ${statut}`,
      `La commande ${commande.numero_commande} est maintenant ${statut}`,
      JSON.stringify({ commande_id: id, numero: commande.numero_commande, statut })
    ]
  )

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { id } = await params
  await execute('DELETE FROM commandes WHERE id=?', [id])
  return NextResponse.json({ success: true })
}
