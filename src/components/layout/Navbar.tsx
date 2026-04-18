'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart, Menu, X, User, LogOut, Sparkles, Search } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [client, setClient] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { items } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('shop_client')
    if (stored) setClient(JSON.parse(stored))
  }, [pathname])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('shop_client')
    setClient(null)
    router.push('/')
  }

  const links = [
    { href: '/', label: 'Accueil' },
    { href: '/boutique', label: 'Boutique' },
    { href: '/suivi', label: 'Suivi commande' },
    { href: '/apropos', label: 'À Propos' },
  ]

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'glass-dark shadow-xl shadow-black/50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white">Shop<span className="text-gradient">Cid</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${pathname === l.href ? 'text-orange-400 bg-orange-500/10' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/panier" className="relative p-2 rounded-xl hover:bg-white/5 transition-all group">
              <ShoppingCart size={22} className="text-white/70 group-hover:text-orange-400 transition-colors" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-xs flex items-center justify-center font-bold pulse-glow">
                  {items.reduce((a, b) => a + b.quantite, 0)}
                </span>
              )}
            </Link>

            {client ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/commande" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all">
                  <User size={16} className="text-orange-400" />
                  <span className="text-sm text-white/80">{client.prenom}</span>
                </Link>
                <button onClick={logout} className="p-2 rounded-xl hover:bg-red-500/10 transition-all group" title="Déconnexion">
                  <LogOut size={18} className="text-white/50 group-hover:text-red-400 transition-colors" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/connexion" className="text-sm text-white/70 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-all">Connexion</Link>
                <Link href="/inscription" className="btn-primary text-sm py-2 px-4">S'inscrire</Link>
              </div>
            )}

            <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-all">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden glass-dark rounded-2xl mb-4 p-4 animate-fade-in">
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all ${pathname === l.href ? 'bg-orange-500/10 text-orange-400' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
                {l.label}
              </Link>
            ))}
            <div className="border-t border-white/10 mt-3 pt-3 flex gap-2">
              {client ? (
                <button onClick={logout} className="w-full btn-outline text-sm">Déconnexion</button>
              ) : (
                <>
                  <Link href="/connexion" onClick={() => setOpen(false)} className="flex-1 btn-outline text-center text-sm py-2">Connexion</Link>
                  <Link href="/inscription" onClick={() => setOpen(false)} className="flex-1 btn-primary text-center text-sm py-2">S'inscrire</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
