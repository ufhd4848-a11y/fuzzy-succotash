'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Calendar, MapPin, CreditCard, User, Phone, Mail, Truck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { Order } from '@/types';
import { formatPrice, formatDateTime, getOrderStatusColor, getOrderStatusLabel, getPaymentStatusLabel, getPaymentMethodLabel } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const orderId = params.id as string;

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiClient.get<Order>(`/orders/${orderId}`);
        if (response.success && response.data) {
          setOrder(response.data);
        } else {
          toast.error('Заказ не найден');
          router.push('/orders');
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
        toast.error('Ошибка загрузки заказа');
        router.push('/orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const handleCancel = async () => {
    if (!confirm('Вы уверены, что хотите отменить заказ?')) return;

    setIsCancelling(true);
    try {
      const response = await apiClient.post(`/orders/${orderId}/cancel`, {});
      if (response.success) {
        toast.success('Заказ отменен');
        setOrder((prev) => prev ? { ...prev, status: 'CANCELLED' } : null);
      } else {
        toast.error(response.message || 'Ошибка отмены заказа');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка отмены заказа');
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePay = async () => {
    try {
      const response = await apiClient.post(`/orders/${orderId}/pay`, {});
      if (response.success) {
        toast.success('Оплата прошла успешно');
        setOrder((prev) => prev ? { ...prev, paymentStatus: 'PAID', status: 'CONFIRMED' } : null);
      } else {
        toast.error(response.message || 'Ошибка оплаты');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка оплаты');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
  const canPay = order.paymentStatus === 'PENDING';

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Back Link */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к заказам
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Заказ #{order.orderNumber}</h1>
            <p className="text-muted-foreground">{formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
              {getOrderStatusLabel(order.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="p-6 rounded-2xl bg-card border">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Товары
              </h2>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-bold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="p-6 rounded-2xl bg-card border">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Информация о доставке
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Получатель</p>
                    <p className="font-medium">{order.firstName} {order.lastName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Телефон</p>
                    <p className="font-medium">{order.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:col-span-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Адрес</p>
                    <p className="font-medium">{order.address}</p>
                  </div>
                </div>

                {order.customerNote && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <div className="h-5 w-5 flex items-center justify-center text-muted-foreground">📝</div>
                    <div>
                      <p className="text-sm text-muted-foreground">Комментарий</p>
                      <p className="font-medium">{order.customerNote}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-2xl bg-card border">
              <h2 className="text-lg font-bold mb-4">Итого</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Товары</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Доставка</span>
                  <span>
                    {order.deliveryFee === 0
                      ? 'Бесплатно'
                      : formatPrice(order.deliveryFee)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Скидка</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Итого</span>
                  <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="p-3 rounded-lg bg-muted mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Способ оплаты</span>
                  <span className="text-sm font-medium">{getPaymentMethodLabel(order.paymentMethod)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Статус оплаты</span>
                  <span className={`text-sm font-medium ${
                    order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {canPay && (
                  <button
                    onClick={handlePay}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <CreditCard className="h-5 w-5" />
                    Оплатить сейчас
                  </button>
                )}

                {canCancel && (
                  <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="w-full flex items-center justify-center gap-2 border border-red-500 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {isCancelling ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                    ) : (
                      'Отменить заказ'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}