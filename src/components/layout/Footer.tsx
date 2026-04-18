import Link from 'next/link'
import { Sparkles, Instagram, Twitter, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark-900/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-base font-display font-bold text-white">
              Shop<span className="text-gradient">Cid</span>
            </span>
          </Link>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            {[
              { href: '/', label: 'Accueil' },
              { href: '/boutique', label: 'Boutique' },
              { href: '/suivi', label: 'Suivi commande' },
              { href: '/panier', label: 'Panier' },
              { href: '/apropos', label: 'À Propos' },
              { href: '/commande', label: 'Mes Commandes' },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="text-white/40 hover:text-orange-400 text-xs transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <a key={i} href="#"
                className="w-7 h-7 glass rounded-lg flex items-center justify-center hover:bg-orange-500/20 transition-all group">
                <Icon size={13} className="text-white/40 group-hover:text-orange-400 transition-colors" />
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 mt-4 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/25 text-xs">© {new Date().getFullYear()} ShopCid. Tous droits réservés.</p>
          <p className="text-white/25 text-xs">
            Développé par <span className="text-gradient font-semibold">Ibrahim Tembely alias Cid</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
