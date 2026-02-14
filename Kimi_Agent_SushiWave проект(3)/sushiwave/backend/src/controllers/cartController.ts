import { Request, Response, NextFunction } from 'express';
import { AppError, ICartItem } from '../types';
import prisma from '../config/prisma';

/**
 * Get cart (validate items and return with product details)
 */
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items } = req.body as { items: ICartItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.json({
        success: true,
        data: {
          items: [],
          total: 0,
        },
      });
      return;
    }

    // Get product details for each cart item
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
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

    // Build cart with product details
    const cartItems = [];
    let total = 0;

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        continue; // Skip items with invalid products
      }

      // Check stock
      const availableQuantity = Math.min(item.quantity, product.stockQuantity);

      if (availableQuantity > 0) {
        const itemTotal = product.price.toNumber() * availableQuantity;
        total += itemTotal;

        cartItems.push({
          productId: product.id,
          quantity: availableQuantity,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            oldPrice: product.oldPrice,
            image: product.image,
            weight: product.weight,
            stockQuantity: product.stockQuantity,
            category: product.category,
          },
        });
      }
    }

    res.json({
      success: true,
      data: {
        items: cartItems,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate cart items
 */
export const validateCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items } = req.body as { items: ICartItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError(400, 'Cart is empty');
    }

    const errors = [];
    const validItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        errors.push({
          productId: item.productId,
          message: 'Product not found',
        });
        continue;
      }

      if (!product.isActive) {
        errors.push({
          productId: item.productId,
          productName: product.name,
          message: 'Product is not available',
        });
        continue;
      }

      if (product.stockQuantity < item.quantity) {
        errors.push({
          productId: item.productId,
          productName: product.name,
          message: `Insufficient stock. Available: ${product.stockQuantity}`,
        });
        continue;
      }

      validItems.push({
        productId: product.id,
        quantity: item.quantity,
        name: product.name,
        price: product.price,
      });
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Cart validation failed',
        errors,
        validItems,
      });
      return;
    }

    res.json({
      success: true,
      message: 'Cart is valid',
      data: { items: validItems },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get cart totals
 */
export const getCartTotals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items } = req.body as { items: ICartItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.json({
        success: true,
        data: {
          subtotal: 0,
          deliveryFee: 0,
          discount: 0,
          total: 0,
          itemCount: 0,
        },
      });
      return;
    }

    let subtotal = 0;
    let itemCount = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product && product.isActive) {
        const quantity = Math.min(item.quantity, product.stockQuantity);
        if (quantity > 0) {
          subtotal += product.price.toNumber() * quantity;
          itemCount += quantity;
        }
      }
    }

    // Free delivery for orders over 1000
    const deliveryFee = subtotal >= 1000 ? 0 : 150;
    const total = subtotal + deliveryFee;

    res.json({
      success: true,
      data: {
        subtotal,
        deliveryFee,
        discount: 0,
        total,
        itemCount,
      },
    });
  } catch (error) {
    next(error);
  }
};