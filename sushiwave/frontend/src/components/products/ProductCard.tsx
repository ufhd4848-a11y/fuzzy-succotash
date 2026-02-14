'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Minus, Check, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  showAddButton?: boolean;
}

export function ProductCard({ product, showAddButton = true }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const discount = product.oldPrice
    ? calculateDiscount(product.price, product.oldPrice)
    : 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsAdded(true);
    toast.success(`${product.name} добавлен в корзину`);
    
    setTimeout(() => {
      setIsAdded(false);
      setQuantity(1);
    }, 2000);
  };

  const handleIncrement = () => {
    if (quantity < product.stockQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="inline-flex items-center rounded-full bg-green-500 px-2.5 py-1 text-xs font-medium text-white">
              Новинка
            </span>
          )}
          {discount > 0 && (
            <span className="inline-flex items-center rounded-full bg-red-500 px-2.5 py-1 text-xs font-medium text-white">
              -{discount}%
            </span>
          )}
          {product.isBestseller && (
            <span className="inline-flex items-center rounded-full bg-orange-500 px-2.5 py-1 text-xs font-medium text-white">
              Хит
            </span>
          )}
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-lg font-semibold line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.weight && (
          <p className="text-sm text-muted-foreground mt-1">{product.weight} г</p>
        )}

        <p className="text-sm text-muted-foreground line-clamp-2 mt-2 flex-1">
          {product.description}
        </p>

        {/* Price and Add to Cart */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {showAddButton && (
            <div className="flex items-center gap-2">
              {/* Quantity Controls */}
              <div className="flex items-center rounded-lg border bg-background">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-l-lg hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-8 w-8 items-center justify-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= product.stockQuantity}
                  className="flex h-8 w-8 items-center justify-center rounded-r-lg hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={isAdded || product.stockQuantity === 0}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  isAdded
                    ? 'bg-green-500 text-white'
                    : 'bg-primary text-white hover:bg-primary/90'
                } disabled:opacity-50`}
              >
                {isAdded ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}