'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus, ShoppingCart, Check, Star, Clock, ChefHat, Scale } from 'lucide-react';
import { Product } from '@/types';
import { apiClient } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const params = useParams();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const slug = params.slug as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get<Product>(`/products/slug/${slug}`);
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          toast.error('Товар не найден');
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Ошибка загрузки товара');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setIsAdded(true);
    toast.success(`${product.name} добавлен в корзину`);
    
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleIncrement = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
          <Link href="/menu" className="text-primary hover:underline">
            Вернуться в меню
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.oldPrice
    ? calculateDiscount(product.price, product.oldPrice)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Back Link */}
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад в меню
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && (
                <span className="inline-flex items-center rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
                  Новинка
                </span>
              )}
              {discount > 0 && (
                <span className="inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-sm font-medium text-white">
                  -{discount}%
                </span>
              )}
              {product.isBestseller && (
                <span className="inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-sm font-medium text-white">
                  Хит продаж
                </span>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col"
          >
            {/* Category */}
            {product.category && (
              <Link
                href={`/menu?category=${product.category.slug}`}
                className="text-sm text-primary hover:underline mb-2"
              >
                {product.category.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(128 отзывов)</span>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6">{product.description}</p>

            {/* Nutrition Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {product.weight && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                  <Scale className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Вес</p>
                    <p className="font-medium">{product.weight} г</p>
                  </div>
                </div>
              )}
              {product.calories && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Калории</p>
                    <p className="font-medium">{product.calories} ккал</p>
                  </div>
                </div>
              )}
              {product.proteins && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                  <ChefHat className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Белки</p>
                    <p className="font-medium">{product.proteins} г</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                <div className="h-5 w-5 flex items-center justify-center text-primary">📦</div>
                <div>
                  <p className="text-xs text-muted-foreground">В наличии</p>
                  <p className="font-medium">{product.stockQuantity} шт</p>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            {/* Add to Cart */}
            <div className="flex items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center rounded-xl border bg-background">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="flex h-12 w-12 items-center justify-center rounded-l-xl hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="flex h-12 w-12 items-center justify-center text-lg font-medium">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= product.stockQuantity}
                  className="flex h-12 w-12 items-center justify-center rounded-r-xl hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Add Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={isAdded || product.stockQuantity === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                  isAdded
                    ? 'bg-green-500 text-white'
                    : 'bg-primary text-white hover:bg-primary/90'
                } disabled:opacity-50`}
              >
                {isAdded ? (
                  <>
                    <Check className="h-5 w-5" />
                    Добавлено
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    В корзину
                  </>
                )}
              </motion.button>
            </div>

            {/* Free Delivery Notice */}
            {product.price * quantity < 1000 && (
              <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Добавьте товаров еще на {formatPrice(1000 - product.price * quantity)} для бесплатной доставки!
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}