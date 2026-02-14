'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Phone, MapPin, ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-8 md:p-12"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Готовы сделать заказ?
            </h2>
            <p className="text-white/80 max-w-md">
              Закажите сейчас и получите скидку 10% на первый заказ. 
              Доставка бесплатно при заказе от 1000 ₽!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-primary shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
            >
              Заказать сейчас
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <a
              href="tel:+79999999999"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              <Phone className="h-5 w-5" />
              +7 (999) 999-99-99
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div className="relative z-10 mt-8 pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <span>Москва, ул. Суши, 1</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-white/40" />
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            <span>Работаем 24/7</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}