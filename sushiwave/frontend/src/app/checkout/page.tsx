'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { CreditCard, Truck, Wallet, MapPin, User, Phone, Mail, ArrowRight, Check } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { Product, CartTotals as CartTotalsType, Order, PaymentMethod } from '@/types';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'Введите имя'),
  lastName: z.string().min(1, 'Введите фамилию'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().min(5, 'Введите телефон'),
  address: z.string().min(10, 'Введите полный адрес'),
  paymentMethod: z.enum(['CARD', 'CASH', 'ONLINE']),
  customerNote: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

interface CartItemWithProduct {
  productId: string;
  quantity: number;
  product: Product;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { items, clearCart } = useCartStore();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [cartTotals, setCartTotals] = useState<CartTotalsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'CARD',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  const paymentMethod = watch('paymentMethod');

  // Fetch cart details
  useEffect(() => {
    const fetchCartDetails = async () => {
      if (items.length === 0) {
        router.push('/cart');
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
  }, [items, router]);

  const onSubmit = async (data: CheckoutForm) => {
    setIsSubmitting(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const response = await apiClient.post<Order>('/orders', {
        ...data,
        items: orderItems,
      });

      if (response.success && response.data) {
        toast.success('Заказ успешно создан!');
        clearCart();
        router.push(`/orders/${response.data.id}`);
      } else {
        toast.error(response.message || 'Ошибка создания заказа');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка создания заказа');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8"
      >
        Оформление заказа
      </motion.h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-card border"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Контактная информация
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Имя *</label>
                  <input
                    {...register('firstName')}
                    className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Фамилия *</label>
                  <input
                    {...register('lastName')}
                    className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Телефон *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      {...register('phone')}
                      placeholder="+7 (999) 999-99-99"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-card border"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Адрес доставки
              </h2>

              <div>
                <label className="block text-sm font-medium mb-2">Полный адрес *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    {...register('address')}
                    placeholder="Город, улица, дом, квартира"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Комментарий к заказу</label>
                <textarea
                  {...register('customerNote')}
                  rows={3}
                  placeholder="Например: код домофона, этаж, подъезд"
                  className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-card border"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Способ оплаты
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    value="CARD"
                    {...register('paymentMethod')}
                    className="sr-only"
                  />
                  <CreditCard className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <p className="font-medium">Картой курьеру</p>
                  </div>
                </label>

                <label
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'CASH'
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    value="CASH"
                    {...register('paymentMethod')}
                    className="sr-only"
                  />
                  <Wallet className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <p className="font-medium">Наличными</p>
                  </div>
                </label>

                <label
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'ONLINE'
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    value="ONLINE"
                    {...register('paymentMethod')}
                    className="sr-only"
                  />
                  <Truck className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <p className="font-medium">Онлайн</p>
                  </div>
                </label>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-24 p-6 rounded-2xl bg-card border"
            >
              <h2 className="text-xl font-bold mb-4">Ваш заказ</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              {cartTotals && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Товары</span>
                    <span>{formatPrice(cartTotals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Доставка</span>
                    <span>
                      {cartTotals.deliveryFee === 0
                        ? 'Бесплатно'
                        : formatPrice(cartTotals.deliveryFee)}
                    </span>
                  </div>
                  {cartTotals.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Скидка</span>
                      <span>-{formatPrice(cartTotals.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Итого</span>
                    <span className="text-primary">{formatPrice(cartTotals.total)}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Подтвердить заказ
                  </>
                )}
              </button>

              <p className="mt-4 text-xs text-center text-muted-foreground">
                Нажимая кнопку, вы соглашаетесь с условиями доставки
              </p>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  );
}