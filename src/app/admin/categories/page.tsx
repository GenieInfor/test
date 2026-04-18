'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Pencil, Trash2, Tag, X } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import type { Categorie } from '@/types'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Categorie[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Categorie | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data.categories || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Désactiver cette catégorie ?')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    toast.success('Catégorie désactivée')
    fetchData()
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Catégories</h1>
            <p className="text-white/40 text-xs mt-0.5">{categories.length} catégorie(s)</p>
          </div>
          <button onClick={() => { setEditing(null); setShowModal(true) }}
            className="btn-primary inline-flex items-center gap-2 text-sm py-2.5">
            <Plus size={16} /> <span className="hidden sm:inline">Nouvelle</span> catégorie
          </button>
        </div>

        {loading ? <div className="text-center py-10 text-white/30 text-sm">Chargement...</div>
        : categories.length === 0 ? (
          <div className="text-center py-14 glass rounded-2xl">
            <Tag size={36} className="text-white/10 mx-auto mb-2" />
            <p className="text-white/30 text-sm">Aucune catégorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map(cat => (
              <div key={cat.id} className="glass rounded-2xl border border-white/5 overflow-hidden group hover:border-orange-500/20 transition-all">
                <div className="relative h-28 bg-white/5">
                  {cat.image_url
                    ? <Image src={cat.image_url} alt={cat.nom} fill className="object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                    : <div className="absolute inset-0 flex items-center justify-center"><Tag size={28} className="text-white/10" /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                </div>
                <div className="p-3">
                  <h3 className="text-white font-semibold text-sm mb-0.5 truncate">{cat.nom}</h3>
                  {cat.description && <p className="text-white/40 text-xs line-clamp-1 mb-2">{cat.description}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(cat); setShowModal(true) }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl glass hover:bg-orange-500/10 transition-all text-white/50 hover:text-orange-400 text-xs">
                      <Pencil size={12} /> Modifier
                    </button>
                    <button onClick={() => handleDelete(cat.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl glass hover:bg-red-500/10 transition-all text-white/50 hover:text-red-400 text-xs">
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CategorieModal categorie={editing} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchData() }} />
      )}
    </AdminLayout>
  )
}

function CategorieModal({ categorie, onClose, onSaved }: { categorie: Categorie | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ nom: categorie?.nom || '', description: categorie?.description || '', image_url: categorie?.image_url || '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(categorie?.image_url || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('nom', form.nom); fd.append('description', form.description); fd.append('image_url', form.image_url)
      if (imageFile) fd.append('image', imageFile)
      const url = categorie ? `/api/categories/${categorie.id}` : '/api/categories'
      const res = await fetch(url, { method: categorie ? 'PUT' : 'POST', body: fd })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(categorie ? 'Catégorie modifiée' : 'Catégorie créée')
      onSaved()
    } catch (err: any) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-dark rounded-t-3xl sm:rounded-3xl border border-white/10 w-full sm:max-w-md p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">{categorie ? 'Modifier' : 'Nouvelle'} catégorie</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors"><X size={18} className="text-white/40" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3 items-start">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
              {imagePreview ? <Image src={imagePreview} alt="preview" width={64} height={64} className="object-cover w-full h-full" /> : <Tag size={20} className="text-white/20" />}
            </div>
            <label className="flex-1 cursor-pointer">
              <div className="input-field text-center py-3 text-white/40 text-sm cursor-pointer hover:border-orange-500/40 transition-colors">Importer une image</div>
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if(f){setImageFile(f);setImagePreview(URL.createObjectURL(f))} }} className="hidden" />
            </label>
          </div>
          <input required value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} className="input-field text-sm" placeholder="Nom de la catégorie *" />
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input-field resize-none text-sm" placeholder="Description..." />
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-outline text-sm py-2.5">Annuler</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Enregistrement...' : categorie ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
