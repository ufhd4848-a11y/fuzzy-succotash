import { Router } from 'express';
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validate';
import {
  createCategorySchema,
  updateCategorySchema,
  slugParamSchema,
  idParamSchema,
} from '../utils/validation';

const router = Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', getAllCategories);

/**
 * @route   GET /api/categories/:slug
 * @desc    Get category by slug
 * @access  Public
 */
router.get('/:slug', validateParams(slugParamSchema), getCategoryBySlug);

/**
 * @route   POST /api/categories
 * @desc    Create category
 * @access  Admin
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(createCategorySchema),
  createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Admin
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(updateCategorySchema),
  updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Admin
 */
router.delete('/:id', authenticate, requireAdmin, validateParams(idParamSchema), deleteCategory);

export default router;