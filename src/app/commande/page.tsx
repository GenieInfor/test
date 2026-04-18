'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ShoppingBag, Clock, CheckCircle, XCircle, Package, Download, ExternalLink } from 'lucide-react'

export default function CommandePage() {
  const router = useRouter()
  const [client, setClient] = useState<any>(null)
  const [commandes, setCommandes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('shop_client')
    if (!stored) { router.push('/connexion'); return }
    setClient(JSON.parse(stored))
    fetch('/api/commandes')
      .then(r => r.json())
      .then(d => setCommandes(d.commandes || []))
      .finally(() => setLoading(false))
  }, [router])

  const statutIcon = (s: string) => {
    if (s === 'validée') return <CheckCircle size={16} className="text-emerald-400" />
    if (s === 'annulée') return <XCircle size={16} className="text-red-400" />
    return <Clock size={16} className="text-yellow-400" />
  }

  const openRecu = (numero: string) => {
    window.open(`/recu/${numero}`, '_blank')
  }

  return (
    <main className="min-h-screen bg-animated">
      <Navbar />
      <div className="pt-28 pb-16 px-4 max-w-4xl mx-auto">
        <div className="mb-10">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Espace client</span>
          <h1 className="font-display text-4xl font-black text-white mt-1">
            Mes <span className="text-gradient">Commandes</span>
          </h1>
          {client && <p className="text-white/40 mt-2">Bonjour, {client.prenom} {client.nom} 👋</p>}
        </div>

        {/* Infos client */}
        {client && (
          <div className="glass rounded-2xl border border-white/5 p-6 mb-8">
            <h2 className="text-white font-semibold mb-4">Mes informations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Nom complet', value: `${client.prenom} ${client.nom}` },
                { label: 'Téléphone', value: client.telephone },
                { label: 'Ville', value: client.ville },
                { label: 'Quartier', value: client.quartier },
              ].map(info => (
                <div key={info.label}>
                  <div className="text-white/30 text-xs uppercase tracking-wider mb-1">{info.label}</div>
                  <div className="text-white">{info.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liste commandes */}
        {loading ? (
          <div className="text-center py-16 text-white/30">Chargement de vos commandes...</div>
        ) : commandes.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl">
            <ShoppingBag size={56} className="text-white/10 mx-auto mb-4" />
            <h2 className="text-white/50 text-xl font-display mb-3">Aucune commande pour l'instant</h2>
            <a href="/boutique" className="btn-primary inline-flex items-center gap-2">
              Commencer mes achats
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {commandes.map((c: any) => (
              <div key={c.id} className="glass rounded-2xl border border-white/5 p-5 hover:border-orange-500/10 transition-all">
                <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                  <div>
                    <div className="font-mono text-orange-400 text-sm font-semibold">{c.numero_commande}</div>
                    <div className="text-white/40 text-xs mt-1">
                      {new Date(c.created_at).toLocaleDateString('fr-FR', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {statutIcon(c.statut)}
                    <span className={
                      c.statut === 'validée' ? 'badge-validated' :
                      c.statut === 'annulée' ? 'badge-cancelled' : 'badge-pending'
                    }>
                      {c.statut}
                    </span>
                    {/* Bouton reçu — uniquement si validée */}
                    {c.statut === 'validée' && (
                      <button
                        onClick={() => openRecu(c.numero_commande)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
                      >
                        <Download size={13} />
                        Télécharger le reçu
                      </button>
                    )}
                  </div>
                </div>

                {c.articles && (
                  <div className="flex items-start gap-2 text-white/50 text-sm mb-3">
                    <Package size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{c.articles}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-white/40 text-xs">Total commande</span>
                  <span className="text-orange-400 font-bold">{Number(c.montant_total).toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
