'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Phone, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ telephone: '', mot_de_passe: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      localStorage.setItem('shop_admin', JSON.stringify(data.admin))
      toast.success('Connexion admin réussie')
      router.push('/admin/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-admin flex items-center justify-center px-4">
      {/* Fond décoratif */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
      />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 pulse-glow">
            <ShieldCheck size={28} className="text-orange-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Admin</h1>
          <p className="text-white/40 text-sm mt-1">Accès réservé aux administrateurs</p>
        </div>

        <div className="glass-dark rounded-3xl border border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                required type="tel" placeholder="Numéro de téléphone"
                value={form.telephone}
                onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                className="input-field pl-9"
                autoComplete="off"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                required type={showPwd ? 'text' : 'password'} placeholder="Mot de passe"
                value={form.mot_de_passe}
                onChange={e => setForm(f => ({ ...f, mot_de_passe: e.target.value }))}
                className="input-field pl-9 pr-10"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPwd ? <EyeOff size={16} className="text-white/30" /> : <Eye size={16} className="text-white/30" />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Vérification...' : 'Accéder au panneau'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © ShopCid — Développé par Ibrahim Tembely alias Cid
        </p>
      </div>
    </main>
  )
}
