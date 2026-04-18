import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Shield, Truck, Star, Heart, Users, Award } from 'lucide-react'

export default function AProposPage() {
  const valeurs = [
    { icon: Shield, title: 'Sécurité', desc: 'Transactions 100% sécurisées. Vos données sont protégées.' },
    { icon: Truck, title: 'Livraison rapide', desc: 'Livraison express dans tous les quartiers de la ville.' },
    { icon: Star, title: 'Qualité premium', desc: 'Chaque produit est soigneusement sélectionné.' },
    { icon: Heart, title: 'Satisfaction client', desc: 'Votre satisfaction est notre priorité absolue.' },
    { icon: Users, title: 'Communauté', desc: 'Des milliers de clients nous font confiance.' },
    { icon: Award, title: 'Excellence', desc: 'Nous visons l\'excellence dans chaque commande.' },
  ]

  return (
    <main className="min-h-screen bg-animated">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.12) 0%, transparent 70%)' }} />
        <div className="relative max-w-4xl mx-auto">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Notre histoire</span>
          <h1 className="font-display text-5xl lg:text-6xl font-black text-white mt-3 mb-6">
            À Propos de <span className="text-gradient">ShopCid</span>
          </h1>
          <p className="text-white/50 text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
            ShopCid est né d'une vision simple : rendre le shopping en ligne accessible, sécurisé et agréable pour tous. 
            Depuis notre création, nous nous engageons à offrir la meilleure expérience d'achat.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Notre mission</span>
              <h2 className="font-display text-4xl font-bold text-white mt-2 mb-6">
                Connecter les acheteurs aux meilleurs produits
              </h2>
              <p className="text-white/50 leading-relaxed mb-6">
                Nous sélectionnons rigoureusement chaque produit pour vous garantir une qualité irréprochable. 
                Notre équipe est disponible pour répondre à toutes vos questions et vous accompagner dans vos achats.
              </p>
              <p className="text-white/50 leading-relaxed">
                Que vous soyez un client régulier ou que vous visitiez notre boutique pour la première fois, 
                nous vous garantissons une expérience d'achat unique et mémorable.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '500+', label: 'Produits' },
                { value: '1000+', label: 'Clients' },
                { value: '24/7', label: 'Support IA' },
                { value: '4.9★', label: 'Note' },
              ].map(stat => (
                <div key={stat.label} className="glass rounded-2xl p-6 text-center hover:border-orange-500/20 transition-all">
                  <div className="text-3xl font-display font-black text-gradient mb-2">{stat.value}</div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Ce qui nous définit</span>
            <h2 className="font-display text-4xl font-bold text-white mt-2">Nos valeurs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {valeurs.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-2xl p-6 hover:border-orange-500/20 hover:scale-[1.02] transition-all duration-300 group">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <Icon size={22} className="text-orange-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 border border-orange-500/10">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Prêt à faire votre premier achat ?
          </h2>
          <p className="text-white/50 mb-8">Découvrez nos produits et profitez d'une expérience shopping exceptionnelle.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="/boutique" className="btn-primary">Explorer la boutique</a>
            <a href="/inscription" className="btn-outline">Créer un compte gratuit</a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
