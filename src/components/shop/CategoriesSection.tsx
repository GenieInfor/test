import Link from 'next/link'
import Image from 'next/image'
import { query } from '@/lib/db'
import type { Categorie } from '@/types'

export default async function CategoriesSection() {
  let categories: Categorie[] = []
  try { categories = await query<Categorie>('SELECT * FROM categories WHERE est_active=1 LIMIT 6') } catch {}

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Parcourir</span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mt-2">Nos <span className="text-gradient">Catégories</span></h2>
        </div>
        {categories.length === 0 ? (
          <p className="text-center text-white/40">Aucune catégorie disponible.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <Link key={cat.id} href={`/boutique?categorie=${cat.id}`}
                className="group relative glass rounded-2xl overflow-hidden aspect-[4/3] hover:scale-[1.02] transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/10">
                {cat.image_url ? (
                  <Image src={cat.image_url} alt={cat.nom} fill className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    ['from-orange-900/50 to-orange-600/20','from-blue-900/50 to-blue-600/20','from-purple-900/50 to-purple-600/20',
                     'from-emerald-900/50 to-emerald-600/20','from-rose-900/50 to-rose-600/20','from-amber-900/50 to-amber-600/20'][i % 6]
                  }`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-display font-bold text-xl group-hover:text-orange-300 transition-colors">{cat.nom}</h3>
                  {cat.description && <p className="text-white/50 text-xs mt-1 line-clamp-1">{cat.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
