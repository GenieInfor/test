import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/shop/HeroSection'
import FeaturedProducts from '@/components/shop/FeaturedProducts'
import CategoriesSection from '@/components/shop/CategoriesSection'
import AIAssistant from '@/components/shop/AIAssistant'
import StatsBar from '@/components/shop/StatsBar'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-animated">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <CategoriesSection />
      <FeaturedProducts />
      <AIAssistant />
      <Footer />
    </main>
  )
}
