import { query } from '@/lib/db'
import type { Produit } from '@/types'
import ProductCard from './ProductCard'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default async function FeaturedProducts() {
  let produits: Produit[] = []
  try {
    produits = await query<Produit>(`
      SELECT p.*, c.nom as categorie_nom FROM produits p
      LEFT JOIN categories c ON p.categorie_id = c.id
      WHERE p.est_actif=1 AND p.est_vedette=1
      ORDER BY p.created_at DESC LIMIT 8
    `)
  } catch {}

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Sélection</span>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mt-2">Produits <span className="text-gradient">Vedettes</span></h2>
          </div>
          <Link href="/boutique" className="hidden sm:flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors group">
            <span className="text-sm font-medium">Voir tout</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {produits.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl">
            <p className="text-white/30 text-lg">Aucun produit vedette pour l'instant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {produits.map(p => <ProductCard key={p.id} produit={p} />)}
          </div>
        )}
      </div>
    </section>
  )
}
