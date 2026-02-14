import { Request } from 'express';
import { UserRole, OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

// ==========================================
// User Types
// ==========================================

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role?: UserRole;
}

export interface IUserUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

export interface IUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  role: UserRole;
}

// ==========================================
// Auth Types
// ==========================================

export interface IAuthRequest extends Request {
  user?: IUser;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface IRefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

// ==========================================
// Category Types
// ==========================================

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryCreate {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ICategoryUpdate {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// ==========================================
// Product Types
// ==========================================

export interface IProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice: number | null;
  image: string;
  images: string[];
  weight: number | null;
  calories: number | null;
  proteins: number | null;
  fats: number | null;
  carbohydrates: number | null;
  isActive: boolean;
  isNew: boolean;
  isBestseller: boolean;
  stockQuantity: number;
  categoryId: string;
  category?: ICategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductCreate {
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  weight?: number;
  calories?: number;
  proteins?: number;
  fats?: number;
  carbohydrates?: number;
  isActive?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  stockQuantity?: number;
  categoryId: string;
}

export interface IProductUpdate {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  oldPrice?: number | null;
  image?: string;
  images?: string[];
  weight?: number;
  calories?: number;
  proteins?: number;
  fats?: number;
  carbohydrates?: number;
  isActive?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  stockQuantity?: number;
  categoryId?: string;
}

export interface IProductFilter {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  search?: string;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IProductListResponse {
  products: IProduct[];
  total: number;
  page: number;
  totalPages: number;
}

// ==========================================
// Order Types
// ==========================================

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface IOrderItemCreate {
  productId: string;
  quantity: number;
}

export interface IOrder {
  id: string;
  orderNumber: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  customerNote: string | null;
  adminNote: string | null;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderCreate {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
  customerNote?: string;
  items: IOrderItemCreate[];
}

export interface IOrderUpdate {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  adminNote?: string;
}

export interface IOrderFilter {
  userId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  page?: number;
  limit?: number;
}

// ==========================================
// Cart Types
// ==========================================

export interface ICartItem {
  productId: string;
  quantity: number;
  product?: IProduct;
}

export interface ICart {
  items: ICartItem[];
  total: number;
}

// ==========================================
// API Response Types
// ==========================================

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// ==========================================
// Error Types
// ==========================================

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ==========================================
// Config Types
// ==========================================

export interface IConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  FRONTEND_URL: string;
  COOKIE_DOMAIN: string;
}