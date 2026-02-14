'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Анна М.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5,
    text: 'Лучшие суши в городе! Доставка всегда вовремя, роллы свежие и вкусные. Особенно люблю Филадельфию и Дракона.',
    date: '2 недели назад',
  },
  {
    id: 2,
    name: 'Дмитрий К.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
    text: 'Заказываю уже больше года. Качество всегда на высоте, персонал вежливый. Рекомендую всем!',
    date: '1 месяц назад',
  },
  {
    id: 3,
    name: 'Елена С.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
    text: 'Очень нравится разнообразие меню. Сеты отлично подходят для компании. Цены адекватные, порции большие.',
    date: '3 недели назад',
  },
];

export function TestimonialsSection() {
  return (
    <section className="container mx-auto px-4">
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold tracking-tight"
        >
          Отзывы наших клиентов
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-2 text-muted-foreground"
        >
          Узнайте, что говорят о нас наши довольные клиенты
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative p-6 rounded-2xl bg-card border shadow-sm"
          >
            <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
            
            <div className="flex items-center gap-4 mb-4">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold">{testimonial.name}</h4>
                <div className="flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-4">{testimonial.text}</p>
            
            <p className="text-sm text-muted-foreground/60">{testimonial.date}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}