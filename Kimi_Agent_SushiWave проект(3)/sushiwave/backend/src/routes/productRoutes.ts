import { Router } from 'express';
import {
  getAllProducts,
  getProductBySlug,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} from '../controllers/productController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  productFilterSchema,
  slugParamSchema,
  idParamSchema,
} from '../utils/validation';

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with filters
 * @access  Public
 */
router.get('/', validateQuery(productFilterSchema), getAllProducts);

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products (bestsellers and new)
 * @access  Public
 */
router.get('/featured', getFeaturedProducts);

/**
 * @route   GET /api/products/slug/:slug
 * @desc    Get product by slug
 * @access  Public
 */
router.get('/slug/:slug', validateParams(slugParamSchema), getProductBySlug);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', validateParams(idParamSchema), getProductById);

/**
 * @route   POST /api/products
 * @desc    Create product
 * @access  Admin
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(createProductSchema),
  createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Admin
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(updateProductSchema),
  updateProduct
);

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Update product stock
 * @access  Admin
 */
router.patch('/:id/stock', authenticate, requireAdmin, validateParams(idParamSchema), updateStock);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Admin
 */
router.delete('/:id', authenticate, requireAdmin, validateParams(idParamSchema), deleteProduct);

export default router;