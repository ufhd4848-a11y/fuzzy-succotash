'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { Product, CartTotals as CartTotalsType } from '@/types';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CartItemWithProduct {
  productId: string;
  quantity: number;
  product: Product;
}

export default function CartPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [cartTotals, setCartTotals] = useState<CartTotalsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Fetch cart details
  useEffect(() => {
    const fetchCartDetails = async () => {
      if (items.length === 0) {
        setCartItems([]);
        setCartTotals({
          subtotal: 0,
          deliveryFee: 0,
          discount: 0,
          total: 0,
          itemCount: 0,
        });
        setIsLoading(false);
        return;
      }

      try {
        const [cartResponse, totalsResponse] = await Promise.all([
          apiClient.post<{ items: CartItemWithProduct[]; total: number }>('/cart', { items }),
          apiClient.post<CartTotalsType>('/cart/totals', { items }),
        ]);

        if (cartResponse.success && cartResponse.data) {
          setCartItems(cartResponse.data.items);
        }

        if (totalsResponse.success && totalsResponse.data) {
          setCartTotals(totalsResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch cart details:', error);
        toast.error('Ошибка загрузки корзины');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartDetails();
  }, [items]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Войдите в аккаунт для оформления заказа');
      router.push('/login');
      return;
    }

    setIsCheckingOut(true);
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Корзина пуста</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            Добавьте товары в корзину, чтобы оформить заказ
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Перейти в меню
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8"
      >
        Корзина
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {cartItems.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-4 p-4 rounded-2xl bg-card border"
              >
                {/* Image */}
                <Link
                  href={`/product/${item.product.slug}`}
                  className="flex-shrink-0"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="font-semibold hover:text-primary transition-colors line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  {item.product.weight && (
                    <p className="text-sm text-muted-foreground">
                      {item.product.weight} г
                    </p>
                  )}
                  <p className="text-lg font-bold text-primary mt-2">
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>

                  <div className="flex items-center rounded-lg border bg-background">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="flex h-8 w-10 items-center justify-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product.stockQuantity}
                      className="flex h-8 w-8 items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Clear Cart */}
          <button
            onClick={clearCart}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Очистить корзину
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-24 p-6 rounded-2xl bg-card border"
          >
            <h2 className="text-xl font-bold mb-6">Итого</h2>

            {cartTotals && (
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Товары ({cartTotals.itemCount})</span>
                  <span>{formatPrice(cartTotals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Доставка</span>
                  <span>
                    {cartTotals.deliveryFee === 0
                      ? 'Бесплатно'
                      : formatPrice(cartTotals.deliveryFee)}
                  </span>
                </div>
                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Скидка</span>
                    <span>-{formatPrice(cartTotals.discount)}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Итого</span>
                    <span className="text-primary">{formatPrice(cartTotals.total)}</span>
                  </div>
                </div>
              </div>
            )}

            {cartTotals && cartTotals.subtotal < 1000 && (
              <div className="mb-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm">
                <p className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Package className="h-4 w-4" />
                  Добавьте товаров на {formatPrice(1000 - cartTotals.subtotal)} для бесплатной доставки!
                </p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isCheckingOut ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Оформить заказ
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <Link
              href="/menu"
              className="mt-4 block text-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Продолжить покупки
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}