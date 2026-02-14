import { z } from 'zod';
import { UserRole, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

// ==========================================
// Auth Validation Schemas
// ==========================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
  phone: z.string().max(20, 'Phone number is too long').optional(),
  address: z.string().max(500, 'Address is too long').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ==========================================
// User Validation Schemas
// ==========================================

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});

// ==========================================
// Category Validation Schemas
// ==========================================

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description is too long').optional(),
  image: z.string().url('Invalid image URL').max(500, 'Image URL is too long').optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

// ==========================================
// Product Validation Schemas
// ==========================================

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description is too long'),
  price: z.number().positive('Price must be positive').max(100000, 'Price is too high'),
  oldPrice: z.number().positive('Old price must be positive').max(100000).optional(),
  image: z.string().url('Invalid image URL').max(500, 'Image URL is too long'),
  images: z.array(z.string().url()).max(10, 'Too many images').default([]),
  weight: z.number().int().positive().optional(),
  calories: z.number().int().positive().optional(),
  proteins: z.number().positive().optional(),
  fats: z.number().positive().optional(),
  carbohydrates: z.number().positive().optional(),
  isActive: z.boolean().default(true),
  isNew: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  stockQuantity: z.number().int().min(0).default(0),
  categoryId: z.string().uuid('Invalid category ID'),
});

export const updateProductSchema = createProductSchema.partial();

export const productFilterSchema = z.object({
  categorySlug: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  isNew: z.coerce.boolean().optional(),
  isBestseller: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['price', 'name', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

// ==========================================
// Order Validation Schemas
// ==========================================

export const orderItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive').max(100, 'Quantity is too high'),
});

export const createOrderSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(5).max(20),
  address: z.string().min(10).max(500),
  paymentMethod: z.nativeEnum(PaymentMethod),
  customerNote: z.string().max(1000).optional(),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
});

export const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  adminNote: z.string().max(1000).optional(),
});

export const orderFilterSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// ==========================================
// Cart Validation Schemas
// ==========================================

export const cartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0),
});

// ==========================================
// ID Parameter Schema
// ==========================================

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const slugParamSchema = z.object({
  slug: z.string().min(1),
});

// ==========================================
// Type Exports
// ==========================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;