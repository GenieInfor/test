import { queryOne } from '@/lib/db'

async function getStats() {
  try {
    const stats = await queryOne<any>(`
      SELECT
        (SELECT COUNT(*) FROM produits WHERE est_actif=1) as produits,
        (SELECT COUNT(*) FROM clients) as clients,
        (SELECT COUNT(*) FROM commandes WHERE statut='validée') as commandes
    `)
    return stats || { produits: 0, clients: 0, commandes: 0 }
  } catch { return { produits: 0, clients: 0, commandes: 0 } }
}

export default async function StatsBar() {
  const stats = await getStats()
  const items = [
    { value: `${stats.produits}+`, label: 'Produits disponibles' },
    { value: `${stats.clients}+`, label: 'Clients satisfaits' },
    { value: `${stats.commandes}+`, label: 'Commandes livrées' },
    { value: '4.9/5', label: 'Note moyenne' },
  ]
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="glass rounded-2xl border border-white/5 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/5">
          {items.map((item) => (
            <div key={item.label} className="p-6 text-center">
              <div className="text-3xl font-display font-bold text-gradient mb-1">{item.value}</div>
              <div className="text-white/50 text-sm">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
