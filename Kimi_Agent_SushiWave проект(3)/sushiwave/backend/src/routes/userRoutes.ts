import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateProfile,
  updatePassword,
  updateUserRole,
  deleteUser,
} from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validate';
import {
  updateUserSchema,
  updateUserRoleSchema,
  idParamSchema,
} from '../utils/validation';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/', authenticate, requireAdmin, getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Admin
 */
router.get('/:id', authenticate, requireAdmin, validateParams(idParamSchema), getUserById);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', authenticate, validateBody(updateUserSchema), updateProfile);

/**
 * @route   PUT /api/users/password
 * @desc    Update user password
 * @access  Private
 */
router.put('/password', authenticate, updatePassword);

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role
 * @access  Admin
 */
router.put(
  '/:id/role',
  authenticate,
  requireAdmin,
  validateParams(idParamSchema),
  validateBody(updateUserRoleSchema),
  updateUserRole
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Admin
 */
router.delete('/:id', authenticate, requireAdmin, validateParams(idParamSchema), deleteUser);

export default router;