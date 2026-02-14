import { Response, NextFunction } from 'express';
import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client';
import { IAuthRequest, AppError, IOrderCreate } from '../types';
import prisma from '../config/prisma';
import logger from '../config/logger';

/**
 * Generate unique order number
 */
const generateOrderNumber = async (): Promise<string> => {
  const prefix = 'SW';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  // Get the last order number
  const lastOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: `${prefix}-${year}${month}`,
      },
    },
    orderBy: { orderNumber: 'desc' },
  });

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.slice(-4), 10);
    sequence = lastSequence + 1;
  }

  return `${prefix}-${year}${month}${sequence.toString().padStart(4, '0')}`;
};

/**
 * Calculate order totals
 */
const calculateOrderTotals = async (
  items: { productId: string; quantity: number }[]
): Promise<{
  subtotal: Prisma.Decimal;
  items: Array<{
    productId: string;
    productName: string;
    productImage: string;
    price: Prisma.Decimal;
    quantity: number;
  }>;
}> => {
  let subtotal = new Prisma.Decimal(0);
  const orderItems: Array<{
    productId: string;
    productName: string;
    productImage: string;
    price: Prisma.Decimal;
    quantity: number;
  }> = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (!product) {
      throw new AppError(404, `Product with ID ${item.productId} not found`);
    }

    if (!product.isActive) {
      throw new AppError(400, `Product ${product.name} is not available`);
    }

    if (product.stockQuantity < item.quantity) {
      throw new AppError(
        400,
        `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`
      );
    }

    const itemTotal = product.price.mul(item.quantity);
    subtotal = subtotal.add(itemTotal);

    orderItems.push({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      quantity: item.quantity,
    });
  }

  return { subtotal, items: orderItems };
};

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (req.query.status) {
      where.status = req.query.status as OrderStatus;
    }

    if (req.query.paymentStatus) {
      where.paymentStatus = req.query.paymentStatus as PaymentStatus;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user orders
 */
export const getUserOrders = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      }),
      prisma.order.count({ where: { userId: req.user.id } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    // Check if user is authorized to view this order
    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      throw new AppError(403, 'Not authorized to view this order');
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create order
 */
export const createOrder = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orderData: IOrderCreate = req.body;

    // Calculate order totals and validate items
    const { subtotal, items: orderItems } = await calculateOrderTotals(orderData.items);

    // Calculate delivery fee (free for orders over 1000)
    const deliveryFee = subtotal.greaterThanOrEqualTo(1000)
      ? new Prisma.Decimal(0)
      : new Prisma.Decimal(150);

    const total = subtotal.add(deliveryFee);

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order with items
    const order = await prisma.$transaction(async (tx) => {
      // Update product stock
      for (const item of orderData.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: req.user?.id || null,
          firstName: orderData.firstName,
          lastName: orderData.lastName,
          email: orderData.email,
          phone: orderData.phone,
          address: orderData.address,
          paymentMethod: orderData.paymentMethod,
          customerNote: orderData.customerNote || null,
          subtotal,
          deliveryFee,
          total,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      return newOrder;
    });

    logger.info({
      message: 'Order created',
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: req.user?.id,
      total: total.toString(),
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order (admin only)
 */
export const updateOrder = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, adminNote } = req.body;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new AppError(404, 'Order not found');
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        paymentStatus,
        adminNote,
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info({
      message: 'Order updated',
      orderId: order.id,
      status,
      paymentStatus,
      updatedBy: req.user?.id,
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    // Check if user is authorized to cancel this order
    if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
      throw new AppError(403, 'Not authorized to cancel this order');
    }

    // Check if order can be cancelled
    if (order.status === OrderStatus.DELIVERED) {
      throw new AppError(400, 'Cannot cancel delivered order');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new AppError(400, 'Order is already cancelled');
    }

    // Cancel order and restore stock
    await prisma.$transaction(async (tx) => {
      // Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }

      // Update order status
      await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
        },
      });
    });

    logger.info({
      message: 'Order cancelled',
      orderId: order.id,
      cancelledBy: req.user.id,
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process payment (mock)
 */
export const processPayment = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'Not authorized to process payment for this order');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new AppError(400, 'Order is already paid');
    }

    // Mock payment processing
    // In production, integrate with actual payment gateway
    const paymentSuccess = true;

    if (paymentSuccess) {
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.CONFIRMED,
        },
        include: {
          items: true,
        },
      });

      logger.info({
        message: 'Payment processed',
        orderId: order.id,
        amount: order.total.toString(),
      });

      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: { order: updatedOrder },
      });
    } else {
      await prisma.order.update({
        where: { id },
        data: {
          paymentStatus: PaymentStatus.FAILED,
        },
      });

      throw new AppError(400, 'Payment failed');
    }
  } catch (error) {
    next(error);
  }
};