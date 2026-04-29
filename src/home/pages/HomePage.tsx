import { HomeHeroSection } from '@/home/components/HomeHeroSection'
import { HomeLocationSection } from '@/home/components/HomeLocationSection'
import { HomePortfolioSection } from '@/home/components/HomePortfolioSection'
import { HomeServicesSection } from '@/home/components/HomeServicesSection'
import { HomeTestimonialsSection } from '@/home/components/HomeTestimonialsSection'
import { HomeWhyUsSection } from '@/home/components/HomeWhyUsSection'

export const HomePage = () => {
  return (
    <>
      <HomeHeroSection />
      <HomeServicesSection />
      <HomeWhyUsSection />
      <HomePortfolioSection />
      <HomeTestimonialsSection />
      <HomeLocationSection />
    </>
  )
}
