'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Product, ProductListResponse, Category } from '@/types';
import { apiClient } from '@/lib/api';
import { ProductCard } from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, debounce } from '@/lib/utils';

export default function MenuPage() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  const isNew = searchParams.get('new') === 'true';
  const isBestseller = searchParams.get('bestseller') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categorySlug);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<Category[]>('/categories');
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number | boolean | undefined> = {
        page,
        limit: 12,
        sortBy,
        sortOrder,
      };

      if (selectedCategory) {
        params.categorySlug = selectedCategory;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (isNew) {
        params.isNew = true;
      }

      if (isBestseller) {
        params.isBestseller = true;
      }

      if (priceRange[0] > 0) {
        params.minPrice = priceRange[0];
      }

      if (priceRange[1] < 5000) {
        params.maxPrice = priceRange[1];
      }

      const response = await apiClient.get<ProductListResponse>('/products', params);
      if (response.success && response.data) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, sortBy, sortOrder, selectedCategory, searchQuery, isNew, isBestseller, priceRange]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
      setPage(1);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 5000]);
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = selectedCategory || priceRange[0] > 0 || priceRange[1] < 5000;

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Меню</h1>
        <p className="text-muted-foreground">
          Выберите из нашего разнообразного меню свежих суши и роллов
        </p>
      </motion.div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск по меню..."
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-medium transition-all',
              showFilters || hasActiveFilters
                ? 'bg-primary text-white border-primary'
                : 'bg-background hover:bg-accent'
            )}
          >
            <SlidersHorizontal className="h-5 w-5" />
            Фильтры
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary text-xs">
                !
              </span>
            )}
          </button>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="createdAt-desc">Сначала новые</option>
            <option value="createdAt-asc">Сначала старые</option>
            <option value="price-asc">Цена: по возрастанию</option>
            <option value="price-desc">Цена: по убыванию</option>
            <option value="name-asc">Название: А-Я</option>
            <option value="name-desc">Название: Я-А</option>
          </select>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl border bg-card"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categories */}
              <div>
                <h3 className="font-medium mb-3">Категории</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm transition-colors',
                      !selectedCategory
                        ? 'bg-primary text-white'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    Все
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm transition-colors',
                        selectedCategory === category.slug
                          ? 'bg-primary text-white'
                          : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-medium mb-3">Цена</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
                    }
                    placeholder="От"
                    className="w-24 px-3 py-2 rounded-lg border bg-background"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value) || 5000])
                    }
                    placeholder="До"
                    className="w-24 px-3 py-2 rounded-lg border bg-background"
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
                Сбросить фильтры
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
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
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">Товары не найдены</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-primary hover:underline"
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
}