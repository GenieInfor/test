'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Search, Package, Clock, CheckCircle, XCircle, MapPin, Phone, FileText } from 'lucide-react'

const statutConfig: Record<string, { icon: any; color: string; label: string; bg: string }> = {
  en_attente: { icon: Clock, color: 'text-yellow-400', label: 'En attente de confirmation', bg: 'bg-yellow-500/10' },
  validée:    { icon: CheckCircle, color: 'text-emerald-400', label: 'Commande validée ✅', bg: 'bg-emerald-500/10' },
  annulée:    { icon: XCircle, color: 'text-red-400', label: 'Commande annulée', bg: 'bg-red-500/10' },
}

export default function SuiviPage() {
  const [numero, setNumero] = useState('')
  const [commande, setCommande] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const search = async () => {
    if (!numero.trim()) return
    setLoading(true)
    setNotFound(false)
    setCommande(null)
    try {
      const res = await fetch(`/api/commandes/suivi?numero=${encodeURIComponent(numero.trim())}`)
      const data = await res.json()
      if (!res.ok || !data.commande) setNotFound(true)
      else setCommande(data.commande)
    } catch { setNotFound(true) }
    finally { setLoading(false) }
  }

  const statutInfo = commande ? statutConfig[commande.statut] : null

  return (
    <main className="min-h-screen bg-animated">
      <Navbar />
      <div className="pt-32 pb-16 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package size={28} className="text-orange-400" />
          </div>
          <h1 className="font-display text-4xl font-black text-white mb-3">
            Suivi de <span className="text-gradient">commande</span>
          </h1>
          <p className="text-white/50">Entrez votre numéro de commande pour suivre son état en temps réel.</p>
        </div>

        {/* Barre de recherche */}
        <div className="glass-dark rounded-2xl border border-white/10 p-6 mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={numero} onChange={e => setNumero(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder="Ex: CMD-ABC123-XY9Z"
                className="input-field pl-9 font-mono text-sm" />
            </div>
            <button onClick={search} disabled={loading || !numero.trim()} className="btn-primary px-5 flex items-center gap-2 flex-shrink-0">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={16} />}
              <span className="hidden sm:inline">Chercher</span>
            </button>
          </div>
        </div>

        {/* Pas trouvé */}
        {notFound && (
          <div className="text-center glass rounded-2xl p-8 border border-red-500/10 animate-fade-in">
            <XCircle size={40} className="text-red-400/50 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-1">Commande introuvable</h3>
            <p className="text-white/40 text-sm">Vérifiez le numéro dans votre confirmation WhatsApp.</p>
          </div>
        )}

        {/* Résultat */}
        {commande && statutInfo && (
          <div className="space-y-4 animate-slide-up">
            {/* Statut */}
            <div className={`rounded-2xl border border-white/10 p-6 ${statutInfo.bg}`}>
              <div className="flex items-center gap-4 flex-wrap">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${statutInfo.bg}`}>
                  <statutInfo.icon size={28} className={statutInfo.color} />
                </div>
                <div className="flex-1">
                  <p className="text-white/50 text-sm">Statut</p>
                  <p className={`text-xl font-bold font-display ${statutInfo.color}`}>{statutInfo.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/30 text-xs">N° commande</p>
                  <p className="text-orange-400 font-mono text-sm font-semibold">{commande.numero_commande}</p>
                </div>
              </div>

              {/* Bouton reçu — uniquement si validée */}
              {commande.statut === 'validée' && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => window.open(`/recu/${commande.numero_commande}`, '_blank')}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/25 transition-all"
                  >
                    <FileText size={16} />
                    Télécharger mon reçu
                  </button>
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5 border border-white/5">
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Phone size={13} className="text-orange-400 flex-shrink-0" /> {commande.telephone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <MapPin size={13} className="text-orange-400 flex-shrink-0" /> {commande.quartier}
                  </div>
                </div>
              </div>
              <div className="glass rounded-2xl p-5 border border-white/5">
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Récapitulatif</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Date</span>
                    <span className="text-white/70">{new Date(commande.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Total</span>
                    <span className="text-orange-400 font-bold">{Number(commande.montant_total).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Articles */}
            {commande.lignes && commande.lignes.length > 0 && (
              <div className="glass rounded-2xl p-5 border border-white/5">
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Articles</h3>
                <div className="space-y-2">
                  {commande.lignes.map((l: any) => (
                    <div key={l.id} className="flex justify-between text-sm py-1 border-b border-white/5 last:border-0">
                      <span className="text-white/70">{l.nom_produit} <span className="text-white/30">x{l.quantite}</span></span>
                      <span className="text-orange-400 font-semibold">{Number(l.sous_total).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historique */}
            {commande.historique && commande.historique.length > 0 && (
              <div className="glass rounded-2xl p-5 border border-white/5">
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-4">Historique</h3>
                <div className="space-y-3">
                  {commande.historique.map((h: any) => {
                    const info = statutConfig[h.statut]
                    return (
                      <div key={h.id} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${info?.bg || 'bg-white/5'}`}>
                          {info && <info.icon size={14} className={info.color} />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${info?.color || 'text-white'}`}>{info?.label || h.statut}</p>
                          {h.note && <p className="text-white/40 text-xs">{h.note}</p>}
                        </div>
                        <span className="text-white/30 text-xs flex-shrink-0">
                          {new Date(h.created_at).toLocaleString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
