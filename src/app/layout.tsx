import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'ShopCid - Boutique en ligne moderne',
  description: 'Découvrez nos produits exceptionnels à des prix imbattables. Livraison rapide, qualité garantie.',
  keywords: 'boutique, shopping, mode, électronique, maison',
  openGraph: {
    title: 'ShopCid',
    description: 'La meilleure boutique en ligne',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a27',
              color: '#fff',
              border: '1px solid rgba(249,115,22,0.3)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#f97316', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
