'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Calendar, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { Order, OrderListResponse } from '@/types';
import { formatPrice, formatDate, getOrderStatusColor, getOrderStatusLabel, getPaymentStatusLabel } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get<OrderListResponse>(`/orders/my-orders?page=${page}&limit=10`);
        if (response.success && response.data) {
          setOrders(response.data.orders);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">У вас пока нет заказов</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            Сделайте свой первый заказ и отслеживайте его здесь
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Перейти в меню
            <ChevronRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold mb-8">Мои заказы</h1>

        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/orders/${order.id}`}
                className="block p-6 rounded-2xl bg-card border hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        Заказ #{order.orderNumber}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                          order.status
                        )}`}
                      >
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </div>
                      <div>{order.items.length} товаров</div>
                    </div>
                  </div>

                  {/* Price and Arrow */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        {formatPrice(order.total)}
                      </p>
                      {order.deliveryFee > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Доставка: {formatPrice(order.deliveryFee)}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                {/* Preview Items */}
                <div className="mt-4 pt-4 border-t flex gap-2 overflow-x-auto">
                  {order.items.slice(0, 4).map((item) => (
                    <img
                      key={item.id}
                      src={item.productImage}
                      alt={item.productName}
                      className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                    />
                  ))}
                  {order.items.length > 4 && (
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border bg-background disabled:opacity-50 hover:bg-accent transition-colors"
            >
              Назад
            </button>
            <span className="px-4 py-2">
              Страница {page} из {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border bg-background disabled:opacity-50 hover:bg-accent transition-colors"
            >
              Вперед
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}