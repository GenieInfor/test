'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Tag, Star } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'
import type { Produit } from '@/types'

export default function ProductCard({ produit }: { produit: Produit }) {
  const { addItem } = useCart()

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(produit)
    toast.success(`${produit.nom} ajouté au panier !`)
  }

  const hasPromo = produit.prix_promo && produit.prix_promo < produit.prix
  const prixFinal = hasPromo ? produit.prix_promo! : produit.prix
  const reduction = hasPromo ? Math.round((1 - produit.prix_promo! / produit.prix) * 100) : 0

  return (
    <Link href={`/produit/${produit.id}`} className="product-card group block">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-white/5">
        {produit.image_url ? (
          <Image src={produit.image_url} alt={produit.nom} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Tag size={40} className="text-white/10" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasPromo && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">-{reduction}%</span>}
          {produit.est_vedette ? <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">Vedette</span> : null}
          {produit.stock === 0 && <span className="bg-dark-800/90 text-white/60 text-xs px-2 py-0.5 rounded-lg">Épuisé</span>}
        </div>

        {/* Add to cart overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button onClick={handleAdd} disabled={produit.stock === 0}
            className="w-full glass-dark rounded-xl py-2.5 text-sm font-semibold text-white hover:bg-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            <ShoppingCart size={15} />
            {produit.stock === 0 ? 'Épuisé' : 'Ajouter au panier'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {produit.categorie_nom && <span className="text-orange-400/70 text-xs font-medium uppercase tracking-wider">{produit.categorie_nom}</span>}
        <h3 className="text-white font-semibold mt-1 mb-2 line-clamp-2 text-sm leading-snug group-hover:text-orange-300 transition-colors">{produit.nom}</h3>
        <div className="flex items-center gap-2">
          <span className="text-orange-400 font-bold text-lg">{Number(prixFinal).toLocaleString('fr-FR')} FCFA</span>
          {hasPromo && <span className="text-white/30 text-sm line-through">{Number(produit.prix).toLocaleString('fr-FR')}</span>}
        </div>
      </div>
    </Link>
  )
}
