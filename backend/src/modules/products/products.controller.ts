import { Request, Response, NextFunction } from 'express';
import * as productsService from './products.service';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from './products.schema';

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = productQuerySchema.parse(req.query);
    const isAdmin = req.user?.role === 'ADMIN';
    const result = await productsService.getProducts(query, isAdmin);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productsService.getProductBySlug(req.params.slug);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function searchProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ success: true, data: [] });
    const results = await productsService.aiSearch(q, req.user?.userId);
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createProductSchema.parse(req.body);
    const product = await productsService.createProduct(input);
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateProductSchema.parse(req.body);
    const product = await productsService.updateProduct(req.params.id, input);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await productsService.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
}
