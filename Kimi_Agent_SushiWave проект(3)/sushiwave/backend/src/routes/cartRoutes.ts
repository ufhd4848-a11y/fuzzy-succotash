import { Router } from 'express';
import { getCart, validateCart, getCartTotals } from '../controllers/cartController';

const router = Router();

/**
 * @route   POST /api/cart
 * @desc    Get cart with product details
 * @access  Public
 */
router.post('/', getCart);

/**
 * @route   POST /api/cart/validate
 * @desc    Validate cart items
 * @access  Public
 */
router.post('/validate', validateCart);

/**
 * @route   POST /api/cart/totals
 * @desc    Get cart totals
 * @access  Public
 */
router.post('/totals', getCartTotals);

export default router;