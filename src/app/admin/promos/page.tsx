'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Ticket, Trash2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'pourcentage', valeur: '', usage_max: '100', date_expiration: '' })

  const fetchPromos = async () => {
    setLoading(true)
    const res = await fetch('/api/promos')
    const data = await res.json()
    setPromos(data.promos || [])
    setLoading(false)
  }

  useEffect(() => { fetchPromos() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, valeur: parseFloat(form.valeur), usage_max: parseInt(form.usage_max) }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Code créé !')
      setShowModal(false)
      setForm({ code: '', type: 'pourcentage', valeur: '', usage_max: '100', date_expiration: '' })
      fetchPromos()
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Codes Promo</h1>
            <p className="text-white/40 text-xs mt-0.5">{promos.length} code(s)</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2 text-sm py-2.5">
            <Plus size={16} /> Nouveau code
          </button>
        </div>

        {/* Grille de codes */}
        {loading ? <div className="text-center py-10 text-white/30 text-sm">Chargement...</div>
        : promos.length === 0 ? (
          <div className="text-center py-14 glass rounded-2xl">
            <Ticket size={36} className="text-white/10 mx-auto mb-2" />
            <p className="text-white/30 text-sm">Aucun code promo</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {promos.map((p: any) => (
              <div key={p.id} className={`glass rounded-2xl border p-5 ${p.est_actif ? 'border-white/5' : 'border-red-500/10 opacity-60'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-1.5">
                    <span className="text-orange-400 font-mono font-bold text-lg">{p.code}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg ${p.est_actif ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {p.est_actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Réduction</span>
                    <span className="font-semibold text-white">{p.valeur}{p.type === 'pourcentage' ? '%' : ' FCFA'}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Utilisations</span>
                    <span>{p.usage_count}/{p.usage_max}</span>
                  </div>
                  {p.date_expiration && (
                    <div className="flex justify-between text-white/60">
                      <span>Expire le</span>
                      <span>{new Date(p.date_expiration).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>
                {/* Barre progression utilisation */}
                <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (p.usage_count / p.usage_max) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal création */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass-dark rounded-t-3xl sm:rounded-3xl border border-white/10 w-full sm:max-w-md p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Nouveau code promo</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                <X size={18} className="text-white/40" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="Ex: PROMO20 *" className="input-field text-sm font-mono uppercase" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field text-sm cursor-pointer">
                  <option value="pourcentage">Pourcentage (%)</option>
                  <option value="fixe">Montant fixe (FCFA)</option>
                </select>
                <input required type="number" value={form.valeur} onChange={e => setForm(f => ({ ...f, valeur: e.target.value }))}
                  placeholder={form.type === 'pourcentage' ? 'Ex: 10 (%)' : 'Ex: 5000 FCFA'}
                  className="input-field text-sm" min="1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Nb. d'utilisations max</label>
                  <input type="number" value={form.usage_max} onChange={e => setForm(f => ({ ...f, usage_max: e.target.value }))}
                    className="input-field text-sm" min="1" />
                </div>
                <div>
                  <label className="text-white/40 text-xs mb-1 block">Date d'expiration</label>
                  <input type="date" value={form.date_expiration} onChange={e => setForm(f => ({ ...f, date_expiration: e.target.value }))}
                    className="input-field text-sm" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline text-sm py-2.5">Annuler</button>
                <button type="submit" className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2">
                  <Check size={15} /> Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
