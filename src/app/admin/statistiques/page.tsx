'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { TrendingUp, ShoppingBag, Users, Package, Clock, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StatistiquesPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'hebdo' | 'mensuel'>('mensuel')

  useEffect(() => {
    fetch('/api/statistiques')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const chartData = view === 'mensuel'
    ? (data?.mensuel || []).map((d: any) => ({ name: d.label, commandes: Number(d.commandes), chiffre: Number(d.chiffre) }))
    : (data?.hebdo || []).map((d: any) => ({
        name: new Date(d.debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        commandes: Number(d.commandes), chiffre: Number(d.chiffre)
      }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="glass-dark rounded-xl border border-white/10 p-3 text-sm">
        <p className="text-white/60 mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex justify-between gap-4">
            <span style={{ color: p.color }}>{p.name === 'chiffre' ? 'CA (FCFA)' : 'Commandes'}</span>
            <span className="text-white font-semibold">{p.name === 'chiffre' ? Number(p.value).toLocaleString('fr-FR') : p.value}</span>
          </div>
        ))}
      </div>
    )
  }

  const exportCSV = () => {
    window.open('/api/admin/export', '_blank')
    toast.success('Export CSV téléchargé !')
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Statistiques</h1>
            <p className="text-white/40 text-xs mt-0.5">Performances de votre boutique</p>
          </div>
          <button onClick={exportCSV}
            className="btn-outline inline-flex items-center gap-2 text-sm py-2.5">
            <Download size={15} /> Export CSV
          </button>
        </div>

        {loading ? (
          <div className="text-center py-24 text-white/30">Chargement...</div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: TrendingUp, label: "Chiffre d'affaires", value: `${Number(data?.global?.chiffre_affaires || 0).toLocaleString('fr-FR')} FCFA`, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
                { icon: ShoppingBag, label: 'Commandes validées', value: data?.global?.total_commandes || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { icon: Users, label: 'Clients inscrits', value: data?.global?.total_clients || 0, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                { icon: Clock, label: 'En attente', value: data?.global?.commandes_attente || 0, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className={`glass rounded-2xl border p-4 ${bg}`}>
                  <Icon size={20} className={`${color} mb-2`} />
                  <div className={`text-xl sm:text-2xl font-bold ${color} mb-0.5`}>{value}</div>
                  <div className="text-white/40 text-xs">{label}</div>
                </div>
              ))}
            </div>

            {/* Toggle */}
            <div className="flex gap-2">
              {(['mensuel', 'hebdo'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    view === v ? 'bg-orange-500/15 border border-orange-500/30 text-orange-400' : 'glass border border-white/10 text-white/50'
                  }`}>
                  {v === 'mensuel' ? '12 derniers mois' : '8 dernières semaines'}
                </button>
              ))}
            </div>

            {/* Graphique CA */}
            <div className="glass rounded-2xl border border-white/5 p-5">
              <h2 className="text-white font-semibold mb-5 text-sm">Chiffre d'affaires</h2>
              {chartData.length === 0 ? (
                <div className="text-center py-14 text-white/30 text-sm">Pas encore de données</div>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorChiffre" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
                      <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="chiffre" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorChiffre)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Graphique commandes */}
            <div className="glass rounded-2xl border border-white/5 p-5">
              <h2 className="text-white font-semibold mb-5 text-sm">Nombre de commandes</h2>
              {chartData.length === 0 ? (
                <div className="text-center py-14 text-white/30 text-sm">Pas encore de données</div>
              ) : (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
                      <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="commandes" fill="#f97316" radius={[4, 4, 0, 0]} opacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top produits */}
            {data?.topProduits?.length > 0 && (
              <div className="glass rounded-2xl border border-white/5 p-5">
                <h2 className="text-white font-semibold mb-4 text-sm">Top 5 produits vendus</h2>
                <div className="space-y-3">
                  {data.topProduits.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 glass rounded-lg flex items-center justify-center text-orange-400 font-bold text-xs flex-shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate">{p.nom_produit}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full"
                              style={{ width: `${(p.total_vendu / data.topProduits[0].total_vendu) * 100}%` }} />
                          </div>
                          <span className="text-white/40 text-xs flex-shrink-0">{p.total_vendu} ventes</span>
                        </div>
                      </div>
                      <div className="text-orange-400 font-semibold text-xs flex-shrink-0">{Number(p.ca).toLocaleString('fr-FR')} FCFA</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
