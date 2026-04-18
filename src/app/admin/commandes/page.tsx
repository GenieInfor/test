'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { CheckCircle, XCircle, Trash2, RefreshCw, Search, ShoppingBag, Phone, MapPin, User, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

type Statut = 'en_attente' | 'validée' | 'annulée'

interface Commande {
  id: number; numero_commande: string; nom: string; prenom: string
  telephone: string; quartier: string; statut: Statut
  montant_total: number; type_client: string; created_at: string
}

export default function AdminCommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [filter, setFilter] = useState<Statut | 'all'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchCommandes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/commandes')
      const data = await res.json()
      setCommandes(data.commandes || [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCommandes() }, [fetchCommandes])

  const updateStatut = async (id: number, statut: Statut) => {
    const res = await fetch(`/api/commandes/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut }),
    })
    if (res.ok) { toast.success(`Commande ${statut}`); fetchCommandes() }
    else toast.error('Erreur')
  }

  const deleteCommande = async (id: number) => {
    if (!confirm('Supprimer définitivement ?')) return
    const res = await fetch(`/api/commandes/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Supprimée'); fetchCommandes() }
  }

  const openRecu = (numero: string) => {
    window.open(`/recu/${numero}`, '_blank')
  }

  const filtered = commandes
    .filter(c => filter === 'all' || c.statut === filter)
    .filter(c => !search ||
      c.numero_commande.toLowerCase().includes(search.toLowerCase()) ||
      `${c.nom} ${c.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
      c.telephone?.includes(search)
    )

  const counts = {
    all: commandes.length,
    en_attente: commandes.filter(c => c.statut === 'en_attente').length,
    validée: commandes.filter(c => c.statut === 'validée').length,
    annulée: commandes.filter(c => c.statut === 'annulée').length,
  }

  const badgeClass = (s: string) =>
    s === 'validée' ? 'badge-validated' : s === 'annulée' ? 'badge-cancelled' : 'badge-pending'

  const tabs = [
    { value: 'all', label: 'Toutes' },
    { value: 'en_attente', label: 'Attente' },
    { value: 'validée', label: 'Validées' },
    { value: 'annulée', label: 'Annulées' },
  ] as const

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Commandes</h1>
            <p className="text-white/40 text-xs mt-0.5">{commandes.length} commande(s)</p>
          </div>
          <button onClick={fetchCommandes} className="btn-outline inline-flex items-center gap-1.5 text-sm py-2">
            <RefreshCw size={14} /> <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {tabs.map(tab => (
            <button key={tab.value} onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                filter === tab.value ? 'bg-orange-500/15 border border-orange-500/30 text-orange-400' : 'glass border border-white/10 text-white/50'
              }`}>
              {tab.label}
              <span className="glass px-1.5 py-0.5 rounded-lg text-[10px]">{counts[tab.value]}</span>
            </button>
          ))}
        </div>

        {/* Recherche */}
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="N° commande, nom, tél..." className="input-field pl-9 text-sm py-2.5" />
        </div>

        {/* Table desktop */}
        <div className="glass rounded-2xl border border-white/5 overflow-hidden hidden lg:block">
          <div className="overflow-x-auto">
            {loading ? <div className="p-10 text-center text-white/30 text-sm">Chargement...</div> : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>N° Commande</th><th>Client</th><th>Contact</th><th>Lieu</th>
                    <th>Montant</th><th>Type</th><th>Statut</th><th>Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={9} className="text-center text-white/30 py-10 text-sm">Aucune commande</td></tr>
                    : filtered.map(c => (
                      <tr key={c.id}>
                        <td className="font-mono text-xs text-orange-400">{c.numero_commande}</td>
                        <td className="font-medium text-sm">{c.prenom} {c.nom}</td>
                        <td className="text-white/50 text-xs">{c.telephone}</td>
                        <td className="text-white/50 text-xs">{c.quartier}</td>
                        <td className="font-semibold text-sm">{Number(c.montant_total).toLocaleString('fr-FR')} FCFA</td>
                        <td>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${c.type_client === 'inscrit' ? 'bg-blue-500/15 text-blue-400' : 'bg-white/5 text-white/40'}`}>
                            {c.type_client}
                          </span>
                        </td>
                        <td><span className={badgeClass(c.statut)}>{c.statut}</span></td>
                        <td className="text-white/40 text-xs">{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <div className="flex gap-1">
                            {/* Reçu — uniquement si validée */}
                            {c.statut === 'validée' && (
                              <button onClick={() => openRecu(c.numero_commande)} title="Voir le reçu"
                                className="p-1.5 rounded-lg hover:bg-emerald-500/10 group transition-colors">
                                <FileText size={15} className="text-white/30 group-hover:text-emerald-400 transition-colors" />
                              </button>
                            )}
                            {c.statut !== 'validée' && (
                              <button onClick={() => updateStatut(c.id, 'validée')} title="Valider"
                                className="p-1.5 rounded-lg hover:bg-emerald-500/10 group transition-colors">
                                <CheckCircle size={15} className="text-white/30 group-hover:text-emerald-400 transition-colors" />
                              </button>
                            )}
                            {c.statut !== 'annulée' && (
                              <button onClick={() => updateStatut(c.id, 'annulée')} title="Annuler"
                                className="p-1.5 rounded-lg hover:bg-yellow-500/10 group transition-colors">
                                <XCircle size={15} className="text-white/30 group-hover:text-yellow-400 transition-colors" />
                              </button>
                            )}
                            <button onClick={() => deleteCommande(c.id)} title="Supprimer"
                              className="p-1.5 rounded-lg hover:bg-red-500/10 group transition-colors">
                              <Trash2 size={15} className="text-white/30 group-hover:text-red-400 transition-colors" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Cards mobile/tablet */}
        <div className="lg:hidden space-y-2">
          {loading ? <div className="text-center py-10 text-white/30 text-sm">Chargement...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-14 glass rounded-2xl">
              <ShoppingBag size={36} className="text-white/10 mx-auto mb-2" />
              <p className="text-white/30 text-sm">Aucune commande</p>
            </div>
          ) : filtered.map(c => (
            <div key={c.id} className="glass rounded-xl border border-white/5 p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-mono text-orange-400 text-xs">{c.numero_commande}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <User size={11} className="text-white/30" />
                    <span className="text-white font-medium text-sm">{c.prenom} {c.nom}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${c.type_client === 'inscrit' ? 'bg-blue-500/15 text-blue-400' : 'bg-white/5 text-white/40'}`}>{c.type_client}</span>
                  </div>
                </div>
                <span className={badgeClass(c.statut)}>{c.statut}</span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                <div className="flex items-center gap-1 text-xs text-white/50">
                  <Phone size={10} className="text-orange-400" /> {c.telephone}
                </div>
                <div className="flex items-center gap-1 text-xs text-white/50">
                  <MapPin size={10} className="text-orange-400" /> {c.quartier}
                </div>
                <span className="text-orange-400 font-bold text-sm">{Number(c.montant_total).toLocaleString('fr-FR')} FCFA</span>
                <span className="text-white/30 text-xs">{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {/* Reçu mobile */}
                {c.statut === 'validée' && (
                  <button onClick={() => openRecu(c.numero_commande)}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-600/30 transition-colors">
                    <FileText size={13} /> Reçu
                  </button>
                )}
                {c.statut !== 'validée' && (
                  <button onClick={() => updateStatut(c.id, 'validée')}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors">
                    <CheckCircle size={13} /> Valider
                  </button>
                )}
                {c.statut !== 'annulée' && (
                  <button onClick={() => updateStatut(c.id, 'annulée')}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl glass border border-yellow-500/30 text-yellow-400 text-xs font-semibold hover:bg-yellow-500/10 transition-colors">
                    <XCircle size={13} /> Annuler
                  </button>
                )}
                <button onClick={() => deleteCommande(c.id)}
                  className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
