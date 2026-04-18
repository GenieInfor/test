'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { User, Phone, Lock, MapPin, Building, Eye, EyeOff, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InscriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '', ville: '', quartier: '', mot_de_passe: '' })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('shop_client', JSON.stringify(data.client))
      toast.success('Compte créé avec succès !')
      router.push('/')
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-animated flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-32">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 pulse-glow">
              <Sparkles size={24} className="text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white">Créer un compte</h1>
            <p className="text-white/40 mt-2 text-sm">Rejoignez la communauté ShopCid</p>
          </div>

          <div className="glass-dark rounded-3xl border border-white/10 p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input required placeholder="Nom *" value={form.nom} onChange={set('nom')} className="input-field pl-9 text-sm" />
                </div>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input required placeholder="Prénom *" value={form.prenom} onChange={set('prenom')} className="input-field pl-9 text-sm" />
                </div>
              </div>

              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input required type="tel" placeholder="Numéro de téléphone *" value={form.telephone} onChange={set('telephone')} className="input-field pl-9" />
              </div>

              <div className="relative">
                <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input required placeholder="Ville *" value={form.ville} onChange={set('ville')} className="input-field pl-9" />
              </div>

              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input required placeholder="Quartier *" value={form.quartier} onChange={set('quartier')} className="input-field pl-9" />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input required type={showPwd ? 'text' : 'password'} placeholder="Mot de passe (min. 8 caractères) *" value={form.mot_de_passe} onChange={set('mot_de_passe')} className="input-field pl-9 pr-10" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPwd ? <EyeOff size={16} className="text-white/30" /> : <Eye size={16} className="text-white/30" />}
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? 'Création...' : 'Créer mon compte'}
              </button>
            </form>

            <p className="text-center text-white/40 text-sm mt-6">
              Déjà inscrit ?{' '}
              <Link href="/connexion" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
