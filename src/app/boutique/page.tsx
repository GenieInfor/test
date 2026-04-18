import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BoutiqueClient from '@/components/shop/BoutiqueClient'
import { query } from '@/lib/db'
import type { Produit, Categorie } from '@/types'

export default async function BoutiquePage() {
  let produits: Produit[] = [], categories: Categorie[] = []
  try {
    produits = await query<Produit>(`SELECT p.*, c.nom as categorie_nom FROM produits p LEFT JOIN categories c ON p.categorie_id = c.id WHERE p.est_actif = 1 ORDER BY p.created_at DESC`)
    categories = await query<Categorie>('SELECT * FROM categories WHERE est_active=1')
  } catch {}

  return (
    <main className="min-h-screen bg-animated">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="relative py-16 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.2) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Découvrir</span>
            <h1 className="font-display text-5xl lg:text-6xl font-black text-white mt-2">Notre <span className="text-gradient">Boutique</span></h1>
            <p className="text-white/50 mt-4 max-w-xl mx-auto">Explorez notre sélection de produits soigneusement choisis pour vous.</p>
          </div>
        </div>
        <BoutiqueClient produits={produits} categories={categories} />
      </div>
      <Footer />
    </main>
  )
}
