import { Suspense } from 'react';
import { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { BenefitsSection } from '@/components/home/BenefitsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { ProductSkeleton } from '@/components/ui/ProductSkeleton';

export const metadata: Metadata = {
  title: 'SushiWave - Доставка суши и роллов',
  description: 'Закажите свежие суши, роллы и сеты с доставкой на дом. Широкий ассортимент, быстрая доставка, высокое качество.',
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <CategoriesSection />
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <Suspense fallback={<ProductSkeleton count={4} />}>
          <FeaturedProducts />
        </Suspense>
      </section>

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}