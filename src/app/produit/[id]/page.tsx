'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import { ShoppingCart, ArrowLeft, Star, Package, Tag, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'

export default function ProduitPage() {
  const { id } = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const [produit, setProduit] = useState<any>(null)
  const [images, setImages] = useState<string[]>([])
  const [avis, setAvis] = useState<any[]>([])
  const [imgIdx, setImgIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showAvisForm, setShowAvisForm] = useState(false)
  const [avisForm, setAvisForm] = useState({ nom: '', note: 5, commentaire: '' })
  const [submittingAvis, setSubmittingAvis] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/produits/${id}/details`).then(r => r.json()),
      fetch(`/api/produits/${id}/avis`).then(r => r.json()),
    ]).then(([pd, av]) => {
      if (pd.produit) {
        setProduit(pd.produit)
        const imgs = [pd.produit.image_url, ...(pd.images || []).map((i: any) => i.image_url)].filter(Boolean)
        setImages(imgs)
      }
      setAvis(av.avis || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const noteMoyenne = avis.length > 0
    ? (avis.reduce((s, a) => s + a.note, 0) / avis.length).toFixed(1)
    : null

  const handleAddToCart = () => {
    if (!produit) return
    addItem(produit)
    toast.success(`${produit.nom} ajouté au panier !`)
  }

  const submitAvis = async () => {
    if (!avisForm.nom.trim()) { toast.error('Entrez votre nom'); return }
    setSubmittingAvis(true)
    try {
      const stored = localStorage.getItem('shop_client')
      const client = stored ? JSON.parse(stored) : null
      const res = await fetch(`/api/produits/${id}/avis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...avisForm, client_id: client?.id || null }),
      })
      if (!res.ok) throw new Error()
      toast.success('Avis envoyé, merci !')
      setShowAvisForm(false)
      setAvisForm({ nom: '', note: 5, commentaire: '' })
      const av = await fetch(`/api/produits/${id}/avis`).then(r => r.json())
      setAvis(av.avis || [])
    } catch { toast.error('Erreur lors de l\'envoi') }
    finally { setSubmittingAvis(false) }
  }

  if (loading) return (
    <main className="min-h-screen bg-animated">
      <Navbar />
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    </main>
  )

  if (!produit) return (
    <main className="min-h-screen bg-animated">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Package size={48} className="text-white/20" />
        <p className="text-white/50">Produit introuvable</p>
        <button onClick={() => router.push('/boutique')} className="btn-primary">Retour à la boutique</button>
      </div>
    </main>
  )

  const hasPromo = produit.prix_promo && produit.prix_promo < produit.prix
  const prixFinal = hasPromo ? produit.prix_promo : produit.prix
  const reduction = hasPromo ? Math.round((1 - produit.prix_promo / produit.prix) * 100) : 0

  return (
    <main className="min-h-screen bg-animated">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        {/* Retour */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Retour</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Galerie images */}
          <div className="space-y-3">
            <div className="relative aspect-square glass rounded-2xl overflow-hidden group">
              {images.length > 0 ? (
                <Image src={images[imgIdx]} alt={produit.nom} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Tag size={64} className="text-white/10" />
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {hasPromo && <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-xl">-{reduction}%</span>}
                {produit.est_vedette === 1 && <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-xl">Vedette</span>}
                {produit.stock === 0 && <span className="bg-black/70 text-white/60 text-sm px-3 py-1 rounded-xl">Épuisé</span>}
              </div>
              {/* Navigation images */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 glass-dark rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10">
                    <ChevronLeft size={18} className="text-white" />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 glass-dark rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10">
                    <ChevronRight size={18} className="text-white" />
                  </button>
                </>
              )}
            </div>
            {/* Miniatures */}
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${imgIdx === i ? 'border-orange-500' : 'border-white/10 hover:border-white/30'}`}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Infos produit */}
          <div className="space-y-6">
            {produit.categorie_nom && (
              <span className="text-orange-400/70 text-sm font-semibold uppercase tracking-wider">{produit.categorie_nom}</span>
            )}
            <h1 className="font-display text-3xl lg:text-4xl font-black text-white">{produit.nom}</h1>

            {/* Note */}
            {noteMoyenne && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={16} className={Number(noteMoyenne) >= s ? 'text-orange-400 fill-orange-400' : 'text-white/20'} />
                  ))}
                </div>
                <span className="text-white/60 text-sm">{noteMoyenne} ({avis.length} avis)</span>
              </div>
            )}

            {/* Prix */}
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-gradient">{Number(prixFinal).toLocaleString('fr-FR')} FCFA</span>
              {hasPromo && <span className="text-white/30 text-xl line-through mb-1">{Number(produit.prix).toLocaleString('fr-FR')}</span>}
            </div>

            {/* Description */}
            {produit.description && (
              <div className="glass rounded-2xl p-5">
                <p className="text-white/60 leading-relaxed">{produit.description}</p>
              </div>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${produit.stock > 5 ? 'bg-emerald-400' : produit.stock > 0 ? 'bg-yellow-400' : 'bg-red-400'}`} />
              <span className="text-white/50 text-sm">
                {produit.stock === 0 ? 'Rupture de stock' : produit.stock <= 5 ? `Plus que ${produit.stock} en stock` : 'En stock'}
              </span>
            </div>

            {/* CTA */}
            <button onClick={handleAddToCart} disabled={produit.stock === 0}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed">
              <ShoppingCart size={22} />
              {produit.stock === 0 ? 'Épuisé' : 'Ajouter au panier'}
            </button>
          </div>
        </div>

        {/* Section avis */}
        <div className="glass rounded-3xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Avis clients</h2>
              <p className="text-white/40 text-sm mt-1">{avis.length} avis{noteMoyenne ? ` — Note moyenne : ${noteMoyenne}/5` : ''}</p>
            </div>
            <button onClick={() => setShowAvisForm(!showAvisForm)} className="btn-outline flex items-center gap-2 text-sm py-2.5">
              <MessageSquare size={15} /> Laisser un avis
            </button>
          </div>

          {/* Formulaire avis */}
          {showAvisForm && (
            <div className="glass rounded-2xl p-5 mb-6 border border-orange-500/20 animate-fade-in">
              <h3 className="text-white font-semibold mb-4">Votre avis</h3>
              <div className="space-y-3">
                <input value={avisForm.nom} onChange={e => setAvisForm(f => ({ ...f, nom: e.target.value }))}
                  placeholder="Votre nom *" className="input-field text-sm" />
                {/* Étoiles */}
                <div>
                  <p className="text-white/50 text-xs mb-2">Note *</p>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setAvisForm(f => ({ ...f, note: s }))}>
                        <Star size={28} className={`transition-colors ${avisForm.note >= s ? 'text-orange-400 fill-orange-400' : 'text-white/20 hover:text-orange-400/50'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={avisForm.commentaire} onChange={e => setAvisForm(f => ({ ...f, commentaire: e.target.value }))}
                  placeholder="Votre commentaire (optionnel)" rows={3} className="input-field resize-none text-sm" />
                <div className="flex gap-2">
                  <button onClick={() => setShowAvisForm(false)} className="flex-1 btn-outline text-sm py-2.5">Annuler</button>
                  <button onClick={submitAvis} disabled={submittingAvis} className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2">
                    {submittingAvis && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Publier
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Liste avis */}
          {avis.length === 0 ? (
            <div className="text-center py-10">
              <Star size={36} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Aucun avis pour l'instant. Soyez le premier !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {avis.map((a: any) => (
                <div key={a.id} className="glass rounded-2xl p-4 border border-white/5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-white font-semibold text-sm">{a.nom_auteur}</span>
                      <div className="flex gap-0.5 mt-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={12} className={a.note >= s ? 'text-orange-400 fill-orange-400' : 'text-white/20'} />
                        ))}
                      </div>
                    </div>
                    <span className="text-white/30 text-xs flex-shrink-0">{new Date(a.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {a.commentaire && <p className="text-white/60 text-sm leading-relaxed">{a.commentaire}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
