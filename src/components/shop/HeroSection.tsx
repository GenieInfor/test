'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Star, ShieldCheck, Truck, Search } from 'lucide-react'

const words = ['Unique', 'Premium', 'Moderne', 'Exclusif']

export default function HeroSection() {
  const [wordIdx, setWordIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2500)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-animated" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-orange-500/5 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-orange-600/5 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)`, backgroundSize: '60px 60px' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
        <div className="inline-flex items-center gap-2 glass border border-orange-500/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
          <Star size={14} className="text-orange-400 fill-orange-400" />
          <span className="text-sm text-white/70">La boutique #1 de confiance</span>
          <Star size={14} className="text-orange-400 fill-orange-400" />
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl font-black text-white mb-4 leading-tight animate-slide-up">
          Shopping<br />
          <span className="relative inline-block">
            <span className="text-gradient">{words[wordIdx]}</span>
            <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-transparent" />
          </span>
        </h1>

        <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto mb-12 animate-fade-in leading-relaxed">
          Découvrez une sélection exceptionnelle de produits. Qualité premium, prix imbattables, livraison rapide.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 animate-slide-up">
          <Link href="/boutique" className="btn-primary text-base py-4 px-8 inline-flex items-center gap-2 group">
            Explorer la boutique
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/suivi" className="btn-outline text-base py-4 px-8 inline-flex items-center gap-2">
            <Search size={18} /> Suivre ma commande
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
          {[
            { icon: ShieldCheck, label: 'Paiement sécurisé' },
            { icon: Truck, label: 'Livraison rapide' },
            { icon: Star, label: 'Qualité garantie' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 glass rounded-xl px-4 py-2">
              <Icon size={16} className="text-orange-400" />
              <span className="text-white/60 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-900 to-transparent" />
    </section>
  )
}
