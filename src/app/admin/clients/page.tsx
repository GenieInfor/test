  'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Search, Users, Phone, MapPin, Calendar } from 'lucide-react'
import type { Client } from '@/types'

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchClients = async (q = '') => {
    setLoading(true)
    const res = await fetch(`/api/clients?search=${encodeURIComponent(q)}`)
    const data = await res.json()
    setClients(data.clients || [])
    setLoading(false)
  }

  useEffect(() => { fetchClients() }, [])
  useEffect(() => {
    const t = setTimeout(() => fetchClients(search), 350)
    return () => clearTimeout(t)
  }, [search])

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Clients</h1>
          <p className="text-white/40 text-xs mt-0.5">{clients.length} client(s) inscrit(s)</p>
        </div>

        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Nom, prénom, téléphone..." className="input-field pl-9 text-sm py-2.5" />
        </div>

        {/* Table desktop */}
        <div className="glass rounded-2xl border border-white/5 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            {loading ? <div className="p-10 text-center text-white/30 text-sm">Chargement...</div>
            : (
              <table className="admin-table">
                <thead><tr><th>#</th><th>Nom complet</th><th>Téléphone</th><th>Ville</th><th>Quartier</th><th>Statut</th><th>Inscrit le</th></tr></thead>
                <tbody>
                  {clients.length === 0
                    ? <tr><td colSpan={7} className="text-center text-white/30 py-10 text-sm">Aucun client</td></tr>
                    : clients.map(c => (
                      <tr key={c.id}>
                        <td className="text-white/30 text-xs">{c.id}</td>
                        <td className="font-medium text-sm">{c.prenom} {c.nom}</td>
                        <td className="font-mono text-sm text-white/60">{c.telephone}</td>
                        <td className="text-white/50 text-sm">{c.ville}</td>
                        <td className="text-white/50 text-sm">{c.quartier}</td>
                        <td><span className={c.est_actif ? 'badge-validated' : 'badge-cancelled'}>{c.est_actif ? 'Actif' : 'Inactif'}</span></td>
                        <td className="text-white/40 text-xs">{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Cards mobile */}
        <div className="md:hidden space-y-2">
          {loading ? <div className="text-center py-10 text-white/30 text-sm">Chargement...</div>
          : clients.length === 0 ? (
            <div className="text-center py-14 glass rounded-2xl">
              <Users size={36} className="text-white/10 mx-auto mb-2" />
              <p className="text-white/30 text-sm">Aucun client</p>
            </div>
          ) : clients.map(c => (
            <div key={c.id} className="glass rounded-xl border border-white/5 p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-white font-semibold text-sm">{c.prenom} {c.nom}</div>
                  <div className="text-white/30 text-xs">#{c.id}</div>
                </div>
                <span className={c.est_actif ? 'badge-validated' : 'badge-cancelled'}>{c.est_actif ? 'Actif' : 'Inactif'}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <div className="flex items-center gap-1 text-xs text-white/50">
                  <Phone size={10} className="text-orange-400" /> {c.telephone}
                </div>
                <div className="flex items-center gap-1 text-xs text-white/50">
                  <MapPin size={10} className="text-orange-400" /> {c.quartier}, {c.ville}
                </div>
                <div className="flex items-center gap-1 text-xs text-white/30">
                  <Calendar size={10} /> {new Date(c.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
