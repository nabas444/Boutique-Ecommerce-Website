import { Router } from 'express';
import * as productsController from './products.controller';
import { authenticate, requireAdmin, optionalAuth } from '../../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', optionalAuth, productsController.getProducts);
router.get('/search', optionalAuth, productsController.searchProducts);
router.get('/:slug', optionalAuth, productsController.getProduct);

// Admin only
router.post('/', authenticate, requireAdmin, productsController.createProduct);
router.put('/:id', authenticate, requireAdmin, productsController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productsController.deleteProduct);

export default router;
