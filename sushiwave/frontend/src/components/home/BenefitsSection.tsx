'use client';

import { motion } from 'framer-motion';
import { Clock, Truck, ChefHat, Leaf, Shield, Headphones } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Быстрая доставка',
    description: 'Доставляем заказы за 30-60 минут. Горячие роллы прямо к вашему столу.',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  },
  {
    icon: ChefHat,
    title: 'Опытные повара',
    description: 'Наши шеф-повара имеют многолетний опыт в приготовлении японской кухни.',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
  },
  {
    icon: Leaf,
    title: 'Свежие ингредиенты',
    description: 'Используем только свежайшие продукты от проверенных поставщиков.',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  },
  {
    icon: Shield,
    title: 'Гарантия качества',
    description: 'Если вам не понравилось - мы вернем деньги или заменим блюдо.',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  },
  {
    icon: Truck,
    title: 'Бесплатная доставка',
    description: 'При заказе от 1000 ₽ доставка совершенно бесплатно.',
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400',
  },
  {
    icon: Headphones,
    title: 'Поддержка 24/7',
    description: 'Наша служба поддержки работает круглосуточно для вашего удобства.',
    color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-400',
  },
];

export function BenefitsSection() {
  return (
    <section className="bg-muted/50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight"
          >
            Почему выбирают нас
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 text-muted-foreground max-w-2xl mx-auto"
          >
            Мы стремимся предоставить лучший сервис и качественную еду для наших клиентов
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-card shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${benefit.color} mb-4`}>
                <benefit.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}