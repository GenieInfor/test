'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/hooks/useCart'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Ticket, X, Check } from 'lucide-react'
import CheckoutModal from '@/components/shop/CheckoutModal'
import toast from 'react-hot-toast'

export default function PanierPage() {
  const { items, removeItem, updateQuantite, total, clearCart } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [promoApplied, setPromoApplied] = useState<any>(null)
  const [checkingPromo, setCheckingPromo] = useState(false)

  useEffect(() => setMounted(true), [])

  const applyPromo = async () => {
    if (!coupon.trim()) return
    setCheckingPromo(true)
    try {
      const res = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verifier', code: coupon, total }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPromoApplied(data)
      toast.success(`Code appliqué ! -${data.reduction.toLocaleString('fr-FR')} FCFA`)
    } catch (err: any) {
      toast.error(err.message || 'Code invalide')
    } finally { setCheckingPromo(false) }
  }

  const removePromo = () => { setPromoApplied(null); setCoupon('') }

  const totalFinal = promoApplied ? promoApplied.total_final : total

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-animated">
      <Navbar />
      <div className="pt-28 pb-16 px-4 max-w-6xl mx-auto">
        <div className="mb-8">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Mon</span>
          <h1 className="font-display text-4xl lg:text-5xl font-black text-white mt-1">
            <span className="text-gradient">Panier</span>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 glass rounded-2xl">
            <ShoppingBag size={64} className="text-white/10 mx-auto mb-6" />
            <h2 className="text-white/60 text-2xl font-display mb-4">Votre panier est vide</h2>
            <Link href="/boutique" className="btn-primary inline-flex items-center gap-2">
              Explorer la boutique <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map(item => {
                const prix = item.produit.prix_promo ?? item.produit.prix
                return (
                  <div key={item.produit.id} className="glass rounded-2xl p-4 flex gap-4 hover:border-orange-500/20 transition-all">
                    <Link href={`/produit/${item.produit.id}`} className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 hover:opacity-80 transition-opacity">
                      {item.produit.image_url ? (
                        <Image src={item.produit.image_url} alt={item.produit.nom} fill className="object-cover" />
                      ) : <div className="flex items-center justify-center h-full"><Tag size={24} className="text-white/20" /></div>}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/produit/${item.produit.id}`}>
                        <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-2 mb-1 hover:text-orange-300 transition-colors">{item.produit.nom}</h3>
                      </Link>
                      {item.produit.categorie_nom && <span className="text-orange-400/60 text-xs">{item.produit.categorie_nom}</span>}
                      <div className="text-orange-400 font-bold mt-1">{Number(prix).toLocaleString('fr-FR')} FCFA</div>
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => updateQuantite(item.produit.id, item.quantite - 1)} className="w-7 h-7 glass rounded-lg flex items-center justify-center hover:bg-orange-500/20 transition-colors">
                          <Minus size={13} />
                        </button>
                        <span className="text-white font-semibold w-8 text-center">{item.quantite}</span>
                        <button onClick={() => updateQuantite(item.produit.id, item.quantite + 1)} className="w-7 h-7 glass rounded-lg flex items-center justify-center hover:bg-orange-500/20 transition-colors">
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeItem(item.produit.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors group">
                        <Trash2 size={16} className="text-white/30 group-hover:text-red-400 transition-colors" />
                      </button>
                      <div className="text-white font-bold text-sm">{(Number(prix) * item.quantite).toLocaleString('fr-FR')} FCFA</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Résumé */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 sticky top-24">
                <h2 className="text-white font-display font-bold text-xl mb-6">Résumé</h2>

                {/* Code promo */}
                <div className="mb-5">
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Ticket size={12} /> Code promo
                  </p>
                  {promoApplied ? (
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                      <Check size={16} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-emerald-400 text-sm font-semibold flex-1">{promoApplied.promo.code}</span>
                      <span className="text-emerald-400 text-sm">-{promoApplied.reduction.toLocaleString('fr-FR')} FCFA</span>
                      <button onClick={removePromo} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                        <X size={14} className="text-emerald-400/60" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && applyPromo()}
                        placeholder="PROMO2024" className="input-field text-sm py-2.5 flex-1 font-mono" />
                      <button onClick={applyPromo} disabled={checkingPromo || !coupon.trim()}
                        className="btn-outline text-sm px-4 py-2.5 flex-shrink-0">
                        {checkingPromo ? <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /> : 'OK'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Totaux */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-white/60 text-sm">
                    <span>Sous-total ({items.reduce((a, b) => a + b.quantite, 0)} articles)</span>
                    <span>{total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-emerald-400 text-sm">
                      <span>Réduction ({promoApplied.promo.code})</span>
                      <span>-{promoApplied.reduction.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/60 text-sm">
                    <span>Livraison</span>
                    <span className="text-emerald-400">Gratuite</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span className="text-gradient">{totalFinal.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                <button onClick={() => setShowCheckout(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                  Valider ma commande <ArrowRight size={16} />
                </button>
                <Link href="/boutique" className="btn-outline w-full flex items-center justify-center gap-2 mt-3 text-sm">
                  Continuer les achats
                </Link>
                <p className="text-center text-white/20 text-xs mt-3 flex items-center justify-center gap-1.5">
                  🔒 Paiement sécurisé à la livraison
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCheckout && (
        <CheckoutModal items={items} total={totalFinal}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => { clearCart(); setShowCheckout(false) }}
        />
      )}
      <Footer />
    </main>
  )
}
