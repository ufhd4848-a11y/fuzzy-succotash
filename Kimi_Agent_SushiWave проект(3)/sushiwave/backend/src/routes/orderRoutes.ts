import { Router } from 'express';
import {
  getAllOrders,
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  processPayment,
} from '../controllers/orderController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  createOrderSchema,
  updateOrderSchema,
  orderFilterSchema,
  idParamSchema,
} from '../utils/validation';

const router = Router();

/**
 * @route   GET /api/orders
 * @desc    Get all orders (admin)
 * @access  Admin
 */
router.get('/', authenticate, requireAdmin, validateQuery(orderFilterSchema), getAllOrders);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get current user orders
 * @access  Private
 */
router.get('/my-orders', authenticate, getUserOrders);

/**
 * @route   POST /api/orders
 * @desc    Create order
 * @access  Public (with optional auth)
 */
router.post('/', validateBody(createOrderSchema), createOrder);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', authenticate, validateParams(idParamSchema), getOrderById);

/**
 * @route   PUT /api/orders/:id
 * @desc    Update order
 * @access  Admin
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(updateOrderSchema),
  updateOrder
);

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.post('/:id/cancel', authenticate, validateParams(idParamSchema), cancelOrder);

/**
 * @route   POST /api/orders/:id/pay
 * @desc    Process payment for order
 * @access  Private
 */
router.post('/:id/pay', authenticate, validateParams(idParamSchema), processPayment);

export default router;