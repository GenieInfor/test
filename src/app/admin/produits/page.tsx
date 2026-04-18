'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Pencil, Trash2, Search, Package, Star, X } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import type { Produit, Categorie } from '@/types'

export default function AdminProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Produit | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rP, rC] = await Promise.all([
        fetch('/api/produits').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
      ])
      setProduits(rP.produits || [])
      setCategories(rC.categories || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = produits.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    p.categorie_nom?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: number) => {
    if (!confirm('Désactiver ce produit ?')) return
    await fetch(`/api/produits/${id}`, { method: 'DELETE' })
    toast.success('Produit désactivé')
    fetchData()
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Produits</h1>
            <p className="text-white/40 text-xs mt-0.5">{produits.length} produit(s)</p>
          </div>
          <button onClick={() => { setEditing(null); setShowModal(true) }}
            className="btn-primary inline-flex items-center justify-center gap-2 text-sm py-2.5">
            <Plus size={16} /> Nouveau produit
          </button>
        </div>

        {/* Recherche */}
        <div className="relative max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..." className="input-field pl-9 text-sm py-2.5" />
        </div>

        {/* Table desktop */}
        <div className="glass rounded-2xl border border-white/5 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            {loading ? <div className="p-10 text-center text-white/30 text-sm">Chargement...</div>
            : filtered.length === 0 ? (
              <div className="p-10 text-center">
                <Package size={36} className="text-white/10 mx-auto mb-2" />
                <p className="text-white/30 text-sm">Aucun produit</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead><tr><th>Image</th><th>Nom</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>⭐</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                          {p.image_url
                            ? <Image src={p.image_url} alt={p.nom} width={36} height={36} className="object-cover w-full h-full" />
                            : <Package size={14} className="text-white/20" />}
                        </div>
                      </td>
                      <td className="font-medium max-w-[160px] truncate text-sm">{p.nom}</td>
                      <td className="text-white/40 text-xs">{p.categorie_nom || '—'}</td>
                      <td>
                        <div className="text-orange-400 font-semibold text-sm">{Number(p.prix).toLocaleString('fr-FR')}</div>
                        {p.prix_promo && <div className="text-emerald-400 text-xs">-{Number(p.prix_promo).toLocaleString('fr-FR')}</div>}
                      </td>
                      <td><span className={`text-sm font-semibold ${p.stock === 0 ? 'text-red-400' : p.stock < 5 ? 'text-yellow-400' : 'text-emerald-400'}`}>{p.stock}</span></td>
                      <td>{p.est_vedette ? <Star size={14} className="text-orange-400 fill-orange-400" /> : null}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditing(p); setShowModal(true) }} className="p-1.5 rounded-lg hover:bg-orange-500/10 group transition-colors">
                            <Pencil size={14} className="text-white/30 group-hover:text-orange-400 transition-colors" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 group transition-colors">
                            <Trash2 size={14} className="text-white/30 group-hover:text-red-400 transition-colors" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Cards mobile */}
        <div className="md:hidden space-y-2">
          {loading ? <div className="text-center py-10 text-white/30 text-sm">Chargement...</div>
          : filtered.length === 0 ? (
            <div className="text-center py-12 glass rounded-2xl">
              <Package size={36} className="text-white/10 mx-auto mb-2" />
              <p className="text-white/30 text-sm">Aucun produit</p>
            </div>
          ) : filtered.map(p => (
            <div key={p.id} className="glass rounded-xl border border-white/5 p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
                {p.image_url
                  ? <Image src={p.image_url} alt={p.nom} width={48} height={48} className="object-cover w-full h-full" />
                  : <Package size={18} className="text-white/20" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-white font-semibold text-sm truncate">{p.nom}</p>
                  {p.est_vedette && <Star size={11} className="text-orange-400 fill-orange-400 flex-shrink-0" />}
                </div>
                <p className="text-white/40 text-xs truncate">{p.categorie_nom || '—'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-orange-400 text-xs font-bold">{Number(p.prix).toLocaleString('fr-FR')} FCFA</span>
                  <span className={`text-xs ${p.stock === 0 ? 'text-red-400' : 'text-emerald-400'}`}>Stock: {p.stock}</span>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => { setEditing(p); setShowModal(true) }} className="p-2 rounded-lg glass hover:bg-orange-500/10 transition-colors">
                  <Pencil size={14} className="text-white/40" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg glass hover:bg-red-500/10 transition-colors">
                  <Trash2 size={14} className="text-white/40" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <ProduitModal produit={editing} categories={categories}
          onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchData() }} />
      )}
    </AdminLayout>
  )
}

function ProduitModal({ produit, categories, onClose, onSaved }: {
  produit: Produit | null; categories: Categorie[]
  onClose: () => void; onSaved: () => void
}) {
  const [form, setForm] = useState({
    nom: produit?.nom || '', description: produit?.description || '',
    prix: produit?.prix?.toString() || '', prix_promo: produit?.prix_promo?.toString() || '',
    stock: produit?.stock?.toString() || '0', categorie_id: produit?.categorie_id?.toString() || '',
    est_vedette: produit?.est_vedette ? 'true' : 'false', est_actif: produit?.est_actif !== false ? 'true' : 'false',
    image_url: produit?.image_url || '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(produit?.image_url || '')
  const [loading, setLoading] = useState(false)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imageFile) fd.append('image', imageFile)
      const url = produit ? `/api/produits/${produit.id}` : '/api/produits'
      const res = await fetch(url, { method: produit ? 'PUT' : 'POST', body: fd })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(produit ? 'Produit modifié' : 'Produit créé')
      onSaved()
    } catch (err: any) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-dark rounded-t-3xl sm:rounded-3xl border border-white/10 w-full sm:max-w-lg p-5 animate-slide-up max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">{produit ? 'Modifier' : 'Nouveau'} produit</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors"><X size={18} className="text-white/40" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Image */}
          <div className="flex gap-3 items-start">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
              {imagePreview ? <Image src={imagePreview} alt="preview" width={64} height={64} className="object-cover w-full h-full" /> : <Package size={20} className="text-white/20" />}
            </div>
            <label className="flex-1 cursor-pointer">
              <div className="input-field text-center py-3 cursor-pointer hover:border-orange-500/40 transition-colors text-white/40 text-sm">
                Importer une image
              </div>
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          </div>
          <div>
            <input required value={form.nom} onChange={set('nom')} className="input-field text-sm" placeholder="Nom du produit *" />
          </div>
          <div>
            <textarea value={form.description} onChange={set('description')} rows={2} className="input-field resize-none text-sm" placeholder="Description..." />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input required type="number" value={form.prix} onChange={set('prix')} className="input-field text-sm" placeholder="Prix *" min="0" />
            <input type="number" value={form.prix_promo} onChange={set('prix_promo')} className="input-field text-sm" placeholder="Prix promo" min="0" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={form.stock} onChange={set('stock')} className="input-field text-sm" placeholder="Stock" min="0" />
            <select value={form.categorie_id} onChange={set('categorie_id')} className="input-field text-sm cursor-pointer">
              <option value="">— Catégorie —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.est_vedette === 'true'} onChange={e => setForm(f => ({ ...f, est_vedette: e.target.checked ? 'true' : 'false' }))} className="w-4 h-4 accent-orange-500" />
              <span className="text-white/60 text-sm">Vedette</span>
            </label>
            {produit && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.est_actif === 'true'} onChange={e => setForm(f => ({ ...f, est_actif: e.target.checked ? 'true' : 'false' }))} className="w-4 h-4 accent-orange-500" />
                <span className="text-white/60 text-sm">Actif</span>
              </label>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-outline text-sm py-2.5">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Enregistrement...' : produit ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
