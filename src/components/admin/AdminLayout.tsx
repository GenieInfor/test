'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, Tag, Users, ShoppingBag,
  BarChart2, LogOut, Menu, X, Sparkles, ChevronRight,
  Bell, Download, Ticket
} from 'lucide-react'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/produits', icon: Package, label: 'Produits' },
  { href: '/admin/categories', icon: Tag, label: 'Catégories' },
  { href: '/admin/clients', icon: Users, label: 'Clients' },
  { href: '/admin/commandes', icon: ShoppingBag, label: 'Commandes' },
  { href: '/admin/promos', icon: Ticket, label: 'Promos' },
  { href: '/admin/statistiques', icon: BarChart2, label: 'Stats' },
]

const bottomNavItems = navItems.slice(0, 6)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [admin, setAdmin] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [nonLues, setNonLues] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('shop_admin')
    if (stored) setAdmin(JSON.parse(stored))
  }, [])

  useEffect(() => { setSidebarOpen(false) }, [pathname])

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setNonLues(data.nonLues || 0)
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifs])

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'POST' })
    setNonLues(0)
    setNotifications(n => n.map(x => ({ ...x, lue: 1 })))
  }

  const logout = async () => {
    await fetch('/api/auth/admin-logout', { method: 'POST' })
    localStorage.removeItem('shop_admin')
    toast.success('Déconnecté')
    router.push('/admin/login')
  }

  const currentLabel = navItems.find(n => pathname.startsWith(n.href))?.label || 'Admin'

  const typeIcon: Record<string, string> = {
    nouvelle_commande: '🛍️',
    commande: '📦',
    default: '🔔',
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white font-display font-bold text-base leading-none">ShopCid</div>
            <div className="text-white/30 text-xs mt-0.5">Administration</div>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <X size={18} className="text-white/40" />
        </button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                active ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}>
              <Icon size={17} className={active ? 'text-orange-400 flex-shrink-0' : 'text-white/40 group-hover:text-white/70 flex-shrink-0'} />
              <span className="text-sm font-medium">{label}</span>
              {active && <ChevronRight size={13} className="ml-auto text-orange-400/50 flex-shrink-0" />}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-3 border-t border-white/5 space-y-1">
        <button onClick={() => window.open('/api/admin/export', '_blank')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all">
          <Download size={15} className="flex-shrink-0" />
          <span className="text-sm">Export commandes</span>
        </button>
        {admin && (
          <div className="glass rounded-xl px-3 py-2.5">
            <div className="text-white text-sm font-semibold truncate">{admin.nom}</div>
            <div className="text-white/30 text-xs">Administrateur</div>
          </div>
        )}
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all">
          <LogOut size={16} className="flex-shrink-0" />
          <span className="text-sm">Déconnexion</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-admin flex">
      <aside className="hidden lg:flex flex-col w-60 border-r border-white/5 glass-dark fixed h-full z-30">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 glass-dark border-r border-white/5 h-full shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <main className="flex-1 lg:ml-60 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 glass-dark border-b border-white/5 px-4 h-14 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors flex-shrink-0">
            <Menu size={20} className="text-white/60" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-white/30 text-xs hidden sm:block">Admin</span>
            <span className="text-white/20 text-xs hidden sm:block">/</span>
            <span className="text-white/70 text-sm font-medium truncate">{currentLabel}</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen && nonLues > 0) markAllRead() }}
              className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
              <Bell size={18} className="text-white/50" />
              {nonLues > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white pulse-glow">
                  {nonLues > 9 ? '9+' : nonLues}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-12 w-72 sm:w-80 glass-dark rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">Notifications</span>
                  <button onClick={() => setNotifOpen(false)} className="p-1 rounded-lg hover:bg-white/5">
                    <X size={14} className="text-white/40" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0
                    ? <div className="text-center py-8 text-white/30 text-sm">Aucune notification</div>
                    : notifications.map((n: any) => (
                      <div key={n.id} className={`px-4 py-3 border-b border-white/5 ${!n.lue ? 'bg-orange-500/5' : ''}`}>
                        <div className="flex items-start gap-2">
                          <span className="text-lg flex-shrink-0">{typeIcon[n.type] || typeIcon.default}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${!n.lue ? 'text-white' : 'text-white/60'}`}>{n.titre}</p>
                            {n.message && <p className="text-white/40 text-xs mt-0.5 truncate">{n.message}</p>}
                            <p className="text-white/25 text-xs mt-1">{new Date(n.created_at).toLocaleString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                          </div>
                          {!n.lue && <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0 mt-1.5" />}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          <Link href="/" target="_blank" className="text-xs text-white/30 hover:text-orange-400 transition-colors flex-shrink-0 whitespace-nowrap">
            Voir le site →
          </Link>
        </header>

        <div className="flex-1 p-3 sm:p-5 pb-20 lg:pb-5">
          {children}
        </div>
      </main>

      {/* Bottom nav mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass-dark border-t border-white/5 px-1 py-1.5">
        <div className="flex items-center justify-around">
          {bottomNavItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}
                className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl transition-all min-w-0 flex-1 ${active ? 'text-orange-400' : 'text-white/30'}`}>
                <Icon size={17} className="flex-shrink-0" />
                <span className="text-[9px] font-medium truncate w-full text-center">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
