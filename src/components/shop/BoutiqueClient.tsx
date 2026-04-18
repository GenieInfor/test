'use client'

import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from './ProductCard'
import type { Produit, Categorie } from '@/types'

export default function BoutiqueClient({ produits, categories }: { produits: Produit[], categories: Categorie[] }) {
  const [search, setSearch] = useState('')
  const [catId, setCatId] = useState<number | null>(null)
  const [sort, setSort] = useState<'recent' | 'prix_asc' | 'prix_desc'>('recent')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let res = [...produits]
    if (search) res = res.filter(p => p.nom.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()))
    if (catId) res = res.filter(p => p.categorie_id === catId)
    if (sort === 'prix_asc') res.sort((a, b) => Number(a.prix) - Number(b.prix))
    else if (sort === 'prix_desc') res.sort((a, b) => Number(b.prix) - Number(a.prix))
    return res
  }, [produits, search, catId, sort])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="input-field pl-11 pr-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={16} className="text-white/40 hover:text-white transition-colors" />
            </button>
          )}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value as any)}
          className="input-field sm:w-48 cursor-pointer"
        >
          <option value="recent">Plus récents</option>
          <option value="prix_asc">Prix croissant</option>
          <option value="prix_desc">Prix décroissant</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${showFilters ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'border-white/10 text-white/60 hover:border-white/20'}`}
        >
          <SlidersHorizontal size={18} />
          <span className="text-sm">Filtres</span>
        </button>
      </div>

      {/* Filtres catégories */}
      {showFilters && (
        <div className="glass rounded-2xl p-4 mb-8 animate-fade-in">
          <p className="text-white/60 text-sm mb-3 font-medium">Catégorie</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCatId(null)}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${!catId ? 'bg-orange-500 text-white' : 'glass border border-white/10 text-white/60 hover:border-orange-500/30'}`}
            >
              Tout
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setCatId(c.id)}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${catId === c.id ? 'bg-orange-500 text-white' : 'glass border border-white/10 text-white/60 hover:border-orange-500/30'}`}
              >
                {c.nom}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Résultats */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-white/40 text-sm">
          {filtered.length} produit{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 glass rounded-2xl">
          <Search size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40 text-lg">Aucun produit trouvé</p>
          <p className="text-white/20 text-sm mt-2">Essayez d'autres termes de recherche</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => <ProductCard key={p.id} produit={p} />)}
        </div>
      )}
    </div>
  )
}
