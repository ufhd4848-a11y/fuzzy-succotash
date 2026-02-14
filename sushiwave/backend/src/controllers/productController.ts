import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError, IProductFilter } from '../types';
import prisma from '../config/prisma';
import logger from '../config/logger';

/**
 * Build product filter query
 */
const buildProductFilter = (filters: IProductFilter): Prisma.ProductWhereInput => {
  const where: Prisma.ProductWhereInput = {};

  if (filters.categorySlug) {
    where.category = {
      slug: filters.categorySlug,
    };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = new Prisma.Decimal(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = new Prisma.Decimal(filters.maxPrice);
    }
  }

  if (filters.isNew !== undefined) {
    where.isNew = filters.isNew;
  }

  if (filters.isBestseller !== undefined) {
    where.isBestseller = filters.isBestseller;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
};

/**
 * Build product sort order
 */
const buildProductSort = (
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Prisma.ProductOrderByWithRelationInput => {
  const order: Prisma.ProductOrderByWithRelationInput = {};

  switch (sortBy) {
    case 'price':
      order.price = sortOrder || 'asc';
      break;
    case 'name':
      order.name = sortOrder || 'asc';
      break;
    case 'createdAt':
      order.createdAt = sortOrder || 'desc';
      break;
    default:
      order.createdAt = 'desc';
  }

  return order;
};

/**
 * Get all products with filters
 */
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters: IProductFilter = {
      categorySlug: req.query.categorySlug as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      isNew: req.query.isNew === 'true',
      isBestseller: req.query.isBestseller === 'true',
      search: req.query.search as string,
      sortBy: req.query.sortBy as 'price' | 'name' | 'createdAt',
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 12,
    };

    const where = buildProductFilter(filters);
    const orderBy = buildProductSort(filters.sortBy, filters.sortOrder);
    const skip = ((filters.page || 1) - 1) * (filters.limit || 12);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: filters.limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / (filters.limit || 12));

    res.json({
      success: true,
      data: products,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by slug
 */
export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;

    const [bestsellers, newProducts] = await Promise.all([
      prisma.product.findMany({
        where: { isBestseller: true, isActive: true },
        take: Math.ceil(limit / 2),
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { isNew: true, isActive: true },
        take: Math.ceil(limit / 2),
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        bestsellers,
        newProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create product (admin only)
 */
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productData = req.body;

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: productData.slug },
    });

    if (existingProduct) {
      throw new AppError(409, 'Product with this slug already exists');
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: productData.categoryId },
    });

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        price: new Prisma.Decimal(productData.price),
        oldPrice: productData.oldPrice ? new Prisma.Decimal(productData.oldPrice) : null,
        proteins: productData.proteins ? new Prisma.Decimal(productData.proteins) : null,
        fats: productData.fats ? new Prisma.Decimal(productData.fats) : null,
        carbohydrates: productData.carbohydrates
          ? new Prisma.Decimal(productData.carbohydrates)
          : null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    logger.info({ message: 'Product created', productId: product.id, name: product.name });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (admin only)
 */
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const productData = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new AppError(404, 'Product not found');
    }

    // Check if new slug is already taken by another product
    if (productData.slug && productData.slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: productData.slug },
      });

      if (slugExists) {
        throw new AppError(409, 'Product with this slug already exists');
      }
    }

    // Check if category exists
    if (productData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: productData.categoryId },
      });

      if (!category) {
        throw new AppError(404, 'Category not found');
      }
    }

    const updateData: Prisma.ProductUpdateInput = { ...productData };

    if (productData.price !== undefined) {
      updateData.price = new Prisma.Decimal(productData.price);
    }
    if (productData.oldPrice !== undefined) {
      updateData.oldPrice = productData.oldPrice
        ? new Prisma.Decimal(productData.oldPrice)
        : null;
    }
    if (productData.proteins !== undefined) {
      updateData.proteins = productData.proteins
        ? new Prisma.Decimal(productData.proteins)
        : null;
    }
    if (productData.fats !== undefined) {
      updateData.fats = productData.fats ? new Prisma.Decimal(productData.fats) : null;
    }
    if (productData.carbohydrates !== undefined) {
      updateData.carbohydrates = productData.carbohydrates
        ? new Prisma.Decimal(productData.carbohydrates)
        : null;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    logger.info({ message: 'Product updated', productId: product.id });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (admin only)
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    await prisma.product.delete({
      where: { id },
    });

    logger.info({ message: 'Product deleted', productId: id });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product stock (admin only)
 */
export const updateStock = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: { stockQuantity: quantity },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    logger.info({ message: 'Product stock updated', productId: id, quantity });

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};