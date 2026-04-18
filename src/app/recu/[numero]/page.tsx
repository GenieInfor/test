import { notFound } from 'next/navigation'
import { query, queryOne } from '@/lib/db'
import PrintButton from './PrintButton'

async function getCommande(numero: string) {
  const commande = await queryOne(`
    SELECT c.*,
      COALESCE(cl.nom, c.nom_invite) as nom,
      COALESCE(cl.prenom, c.prenom_invite) as prenom,
      COALESCE(cl.telephone, c.telephone_invite) as telephone,
      COALESCE(cl.quartier, c.quartier_invite) as quartier,
      COALESCE(cl.ville, '') as ville,
      CASE WHEN c.client_id IS NOT NULL THEN 'inscrit' ELSE 'invité' END as type_client
    FROM commandes c
    LEFT JOIN clients cl ON c.client_id = cl.id
    WHERE c.numero_commande = ?
  `, [numero])
  if (!commande) return null
  const lignes = await query('SELECT * FROM commande_lignes WHERE commande_id = ? ORDER BY id ASC', [commande.id])
  return { ...commande, lignes }
}

export default async function RecuPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params
  const commande = await getCommande(numero)

  if (!commande) notFound()

  if (commande.statut !== 'validée') {
    return (
      <html>
        <head><title>Reçu non disponible</title></head>
        <body style={{ fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0f', color: '#fff' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h2>Reçu non disponible</h2>
            <p style={{ color: '#888', marginTop: 8 }}>Le reçu est disponible uniquement pour les commandes validées.</p>
            <p style={{ color: '#f97316', marginTop: 4 }}>Statut actuel : {commande.statut}</p>
          </div>
        </body>
      </html>
    )
  }

  const date = new Date(commande.created_at).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const heure = new Date(commande.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const titleText = `Reçu ${commande.numero_commande} — ShopCid`

  return (
    <html lang="fr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{titleText}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8f8f8; color: #1a1a1a; min-height: 100vh; }
          .page { max-width: 680px; margin: 0 auto; background: #fff; min-height: 100vh; }
          .print-bar { background: #f97316; color: white; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; gap: 12px; position: sticky; top: 0; z-index: 100; }
          .print-bar span { font-size: 14px; font-weight: 600; }
          .receipt { padding: 40px 40px 60px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 28px; border-bottom: 2px solid #f97316; }
          .brand { display: flex; align-items: center; gap: 12px; }
          .brand-icon { width: 48px; height: 48px; background: #f97316; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
          .brand-name { font-size: 24px; font-weight: 900; color: #1a1a1a; }
          .brand-sub { font-size: 11px; color: #888; margin-top: 2px; letter-spacing: 0.5px; text-transform: uppercase; }
          .receipt-title { text-align: right; }
          .receipt-title h1 { font-size: 28px; font-weight: 900; color: #f97316; }
          .receipt-title .numero { font-size: 13px; color: #555; font-family: monospace; margin-top: 4px; }
          .receipt-title .date { font-size: 12px; color: #888; margin-top: 2px; }
          .badge-valide { display: inline-flex; align-items: center; gap: 6px; background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 28px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; }
          .info-box { background: #fafafa; border: 1px solid #e8e8e8; border-radius: 12px; padding: 18px 20px; }
          .info-box h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #999; margin-bottom: 10px; font-weight: 700; }
          .info-box p { font-size: 14px; color: #333; line-height: 1.8; }
          .info-box .highlight { font-weight: 700; color: #1a1a1a; font-size: 15px; }
          .articles-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #555; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          thead tr { background: #f97316; }
          thead th { padding: 12px 14px; text-align: left; font-size: 12px; font-weight: 700; color: white; text-transform: uppercase; }
          thead th:last-child { text-align: right; }
          tbody tr { border-bottom: 1px solid #f0f0f0; }
          tbody td { padding: 12px 14px; font-size: 14px; color: #333; }
          tbody td:last-child { text-align: right; font-weight: 600; color: #f97316; }
          .prod-name { font-weight: 600; color: #1a1a1a; }
          .prod-qty { color: #888; font-size: 13px; }
          .totals { border-top: 2px solid #f0f0f0; padding-top: 16px; }
          .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #555; }
          .total-final { display: flex; justify-content: space-between; padding: 14px 18px; margin-top: 10px; background: #fff8f0; border: 2px solid #f97316; border-radius: 10px; font-size: 18px; font-weight: 900; color: #f97316; }
          .receipt-footer { margin-top: 40px; padding-top: 24px; border-top: 1px dashed #ddd; text-align: center; }
          .receipt-footer p { font-size: 12px; color: #999; line-height: 1.8; }
          .receipt-footer .merci { font-size: 18px; font-weight: 900; color: #f97316; margin-bottom: 8px; }
          .receipt-footer .dev { font-size: 11px; color: #ccc; margin-top: 16px; }
          @media print {
            .print-bar { display: none !important; }
            body { background: white; }
            .page { max-width: 100%; }
            .receipt { padding: 20px; }
          }
          @media (max-width: 600px) {
            .receipt { padding: 24px 20px 40px; }
            .header { flex-direction: column; gap: 16px; }
            .receipt-title { text-align: left; }
            .info-grid { grid-template-columns: 1fr; }
          }
        `}</style>
      </head>
      <body>
        <div className="page">
          {/* Barre impression — composant client pour le onClick */}
          <div className="print-bar">
            <span>🧾 Reçu de commande</span>
            <PrintButton />
          </div>

          <div className="receipt">
            {/* En-tête */}
            <div className="header">
              <div className="brand">
                <div className="brand-icon">🛍️</div>
                <div>
                  <div className="brand-name">ShopCid</div>
                  <div className="brand-sub">Boutique en ligne</div>
                </div>
              </div>
              <div className="receipt-title">
                <h1>REÇU</h1>
                <div className="numero">{commande.numero_commande}</div>
                <div className="date">{date} à {heure}</div>
              </div>
            </div>

            {/* Badge */}
            <div className="badge-valide">✅ Commande validée</div>

            {/* Infos */}
            <div className="info-grid">
              <div className="info-box">
                <h3>Client</h3>
                <p>
                  <span className="highlight">{commande.prenom} {commande.nom}</span><br />
                  📞 {commande.telephone}<br />
                  {commande.type_client === 'inscrit' ? '✅ Client inscrit' : '👤 Commande invité'}
                </p>
              </div>
              <div className="info-box">
                <h3>Livraison</h3>
                <p>
                  📍 <span className="highlight">{commande.quartier}</span><br />
                  {commande.ville && <>{commande.ville}<br /></>}
                  Paiement à la livraison
                </p>
              </div>
            </div>

            {/* Articles */}
            <div className="articles-title">Articles commandés</div>
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th style={{ textAlign: 'center' }}>Qté</th>
                  <th>Prix unit.</th>
                  <th>Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {(commande.lignes || []).map((l: any) => (
                  <tr key={l.id}>
                    <td className="prod-name">{l.nom_produit}</td>
                    <td style={{ textAlign: 'center' }} className="prod-qty">{l.quantite}</td>
                    <td>{Number(l.prix_unitaire).toLocaleString('fr-FR')} FCFA</td>
                    <td>{Number(l.sous_total).toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totaux */}
            <div className="totals">
              <div className="total-row">
                <span>Sous-total</span>
                <span>{Number(commande.montant_total).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="total-row">
                <span>Frais de livraison</span>
                <span style={{ color: '#2e7d32', fontWeight: 600 }}>Gratuit</span>
              </div>
              <div className="total-final">
                <span>TOTAL PAYÉ</span>
                <span>{Number(commande.montant_total).toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            {/* Footer */}
            <div className="receipt-footer">
              <div className="merci">Merci pour votre commande ! 🎉</div>
              <p>
                Conservez ce reçu comme preuve d'achat.<br />
                Pour toute question : WhatsApp +223 76 45 61 01<br />
                <strong>ShopCid</strong> — Votre boutique de confiance
              </p>
              <div className="dev">Développé par Ibrahim Tembely alias Cid</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
