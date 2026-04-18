'use client'

import { useState, useEffect } from 'react'
import { X, ShoppingBag, User, Phone, MapPin, CheckCircle, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { CartItem } from '@/types'

// ─── Numéro WhatsApp du vendeur ───────────────────────────────────────────────
const WHATSAPP_NUMBER = '22376456101' // +223 76 45 61 01 sans espaces ni +

interface Props {
  items: CartItem[]
  total: number
  onClose: () => void
  onSuccess: () => void
}

interface OrderInfo {
  numero: string
  nom: string
  prenom: string
  telephone: string
  quartier: string
  ville?: string
}

// Génère le message WhatsApp formaté
function buildWhatsAppMessage(order: OrderInfo, items: CartItem[], total: number): string {
  const lignes = items
    .map(i => `  • ${i.produit.nom} x${i.quantite} = ${((i.produit.prix_promo ?? i.produit.prix) * i.quantite).toLocaleString('fr-FR')} FCFA`)
    .join('\n')

  return encodeURIComponent(
    `🛍️ *Nouvelle commande ShopCid*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📋 *N° Commande :* ${order.numero}\n\n` +
    `👤 *Client :* ${order.prenom} ${order.nom}\n` +
    `📞 *Téléphone :* ${order.telephone}\n` +
    `📍 *Localisation :* ${order.quartier}${order.ville ? ', ' + order.ville : ''}\n\n` +
    `🛒 *Articles :*\n${lignes}\n\n` +
    `💰 *Total :* ${total.toLocaleString('fr-FR')} FCFA\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `✅ Commande en attente de confirmation.`
  )
}

export default function CheckoutModal({ items, total, onClose, onSuccess }: Props) {
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null) // succès + infos commande
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', quartier: '' })

  useEffect(() => {
    const stored = localStorage.getItem('shop_client')
    if (stored) setClient(JSON.parse(stored))
  }, [])

  const handleSubmit = async () => {
    if (!client) {
      if (!form.nom || !form.prenom || !form.telephone || !form.quartier) {
        toast.error('Veuillez remplir tous les champs')
        return
      }
    }

    setLoading(true)
    try {
      const res = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            produit_id: i.produit.id,
            nom_produit: i.produit.nom,
            prix_unitaire: i.produit.prix_promo ?? i.produit.prix,
            quantite: i.quantite,
            sous_total: (i.produit.prix_promo ?? i.produit.prix) * i.quantite,
          })),
          montant_total: total,
          client_id: client?.id || null,
          invité: client ? null : form,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Stocker les infos pour le message WhatsApp
      setOrderInfo({
        numero: data.numero_commande,
        nom: client ? client.nom : form.nom,
        prenom: client ? client.prenom : form.prenom,
        telephone: client ? client.telephone : form.telephone,
        quartier: client ? client.quartier : form.quartier,
        ville: client?.ville,
      })
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la commande')
    } finally {
      setLoading(false)
    }
  }

  const openWhatsApp = () => {
    if (!orderInfo) return
    const message = buildWhatsAppMessage(orderInfo, items, total)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
    // Vider le panier après ouverture WhatsApp
    setTimeout(() => onSuccess(), 500)
  }

  const skipWhatsApp = () => {
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={!orderInfo ? onClose : undefined} />
      <div className="relative glass-dark rounded-t-3xl sm:rounded-3xl border border-white/10 w-full sm:max-w-md p-6 animate-slide-up max-h-[92vh] overflow-y-auto">

        {!orderInfo && (
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X size={20} className="text-white/40" />
          </button>
        )}

        {/* ── Succès + redirection WhatsApp ── */}
        {orderInfo ? (
          <div className="text-center py-4">
            {/* Icône succès */}
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-1">Commande passée !</h2>
            <p className="text-white/40 text-sm mb-1">N° <span className="text-orange-400 font-mono font-semibold">{orderInfo.numero}</span></p>
            <p className="text-white/50 text-sm mb-6">Votre commande a bien été enregistrée.</p>

            {/* Récap rapide */}
            <div className="glass rounded-xl p-4 mb-6 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <User size={13} className="text-orange-400 flex-shrink-0" />
                {orderInfo.prenom} {orderInfo.nom}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Phone size={13} className="text-orange-400 flex-shrink-0" />
                {orderInfo.telephone}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MapPin size={13} className="text-orange-400 flex-shrink-0" />
                {orderInfo.quartier}{orderInfo.ville ? `, ${orderInfo.ville}` : ''}
              </div>
            </div>

            {/* CTA WhatsApp */}
            <div className="space-y-3">
              <button
                onClick={openWhatsApp}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-white text-base transition-all duration-300 hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 8px 24px rgba(37,211,102,0.35)' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Envoyer sur WhatsApp
              </button>

              <button onClick={skipWhatsApp} className="w-full py-2.5 rounded-xl text-white/40 hover:text-white/60 text-sm transition-colors">
                Continuer sans WhatsApp
              </button>
            </div>
          </div>

        ) : (
          /* ── Formulaire commande ── */
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <ShoppingBag size={20} className="text-orange-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Finaliser la commande</h2>
                <p className="text-white/40 text-sm">Total : {total.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>

            {/* Récap articles */}
            <div className="glass rounded-xl p-4 mb-5 max-h-32 overflow-y-auto space-y-2">
              {items.map(item => (
                <div key={item.produit.id} className="flex justify-between text-sm">
                  <span className="text-white/70 truncate mr-2">{item.produit.nom} x{item.quantite}</span>
                  <span className="text-orange-400 flex-shrink-0">
                    {((item.produit.prix_promo ?? item.produit.prix) * item.quantite).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 flex justify-between font-semibold text-sm">
                <span className="text-white/60">Total</span>
                <span className="text-orange-400">{total.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            {/* Infos livraison */}
            {client ? (
              <div className="glass rounded-xl p-4 mb-5">
                <p className="text-white/40 text-xs mb-3 uppercase tracking-wider">Livraison pour</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <User size={13} className="text-orange-400" /> {client.prenom} {client.nom}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Phone size={13} className="text-orange-400" /> {client.telephone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <MapPin size={13} className="text-orange-400" /> {client.quartier}, {client.ville}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-5">
                <p className="text-white/50 text-sm mb-3">
                  Pas de compte ?{' '}
                  <a href="/connexion" className="text-orange-400 hover:underline">Se connecter</a>
                  {' '}ou remplir ci-dessous :
                </p>
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <input placeholder="Nom *" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} className="input-field text-sm py-2.5" />
                    <input placeholder="Prénom *" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} className="input-field text-sm py-2.5" />
                  </div>
                  <input placeholder="Numéro de téléphone *" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} className="input-field text-sm py-2.5" />
                  <input placeholder="Quartier / Localisation *" value={form.quartier} onChange={e => setForm(f => ({ ...f, quartier: e.target.value }))} className="input-field text-sm py-2.5" />
                </div>
              </div>
            )}

            {/* Bouton confirmer */}
            <button onClick={handleSubmit} disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi...</>
                : <><ShoppingBag size={18} /> Confirmer la commande</>
              }
            </button>

            {/* Indice WhatsApp */}
            <p className="text-center text-white/25 text-xs mt-3 flex items-center justify-center gap-1.5">
              <MessageCircle size={11} className="text-green-400/60" />
              Vous serez redirigé sur WhatsApp pour confirmer
            </p>
          </>
        )}
      </div>
    </div>
  )
}
