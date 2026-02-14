import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import prisma from '../config/prisma';
import logger from '../config/logger';

/**
 * Get all categories
 */
export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const includeInactive = req.query.includeInactive === 'true';

    const categories = await prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const formattedCategories = categories.map((category) => ({
      ...category,
      productCount: category._count.products,
      _count: undefined,
    }));

    res.json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    res.json({
      success: true,
      data: {
        ...category,
        productCount: category._count.products,
        _count: undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create category (admin only)
 */
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, slug, description, image, sortOrder, isActive } = req.body;

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      throw new AppError(409, 'Category with this slug already exists');
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        sortOrder,
        isActive,
      },
    });

    logger.info({ message: 'Category created', categoryId: category.id, name });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update category (admin only)
 */
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, description, image, sortOrder, isActive } = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new AppError(404, 'Category not found');
    }

    // Check if new slug is already taken by another category
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug },
      });

      if (slugExists) {
        throw new AppError(409, 'Category with this slug already exists');
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        image,
        sortOrder,
        isActive,
      },
    });

    logger.info({ message: 'Category updated', categoryId: category.id });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category (admin only)
 */
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    if (category._count.products > 0) {
      throw new AppError(400, 'Cannot delete category with existing products');
    }

    await prisma.category.delete({
      where: { id },
    });

    logger.info({ message: 'Category deleted', categoryId: id });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};